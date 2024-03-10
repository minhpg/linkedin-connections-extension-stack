import { StateActions, ISetState } from "../state/actions";
import { state } from "../state/extensionState";
import { client } from "../trpc/trpcClient";
import { msToS } from "../utils/msToS";
import { createFetchConfigs } from "./fetchDefaults";
import { z } from "zod";

chrome.runtime.onInstalled.addListener(() => {
  /* Initialize storage with state */
  chrome.storage.local.set(state);

  /* Add message listener */
  chrome.runtime.onMessage.addListener(dispatchActions);
});

/* Handle state dispatch */
const dispatchActions = async (
  message: any,
  _: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.type === StateActions.GetState) {
    sendResponse(state);
  }

  if (message.type === StateActions.SetState) {
    setState({
      state,
      payload: message.payload,
    });
  }

  if (message.type === StateActions.FetchCookie) {
    setState({
      state,
      payload: {
        loading: true,
      },
    });
    const cookies = await fetchCookies();
    setState({
      state,
      payload: {
        loading: false,
        cookies,
      },
    });
  }

  if (message.type === StateActions.FetchLatestSyncState) {
    const syncState = await fetchLatestSyncState();
    if (syncState) {
      const { syncEnd, endCount } = syncState;
      setState({
        state,
        payload: {
          syncEnd,
          startCount: endCount,
        },
      });
    }
  }

  if (message.type === StateActions.FetchConnectionList) {
    setState({
      state,
      payload: {
        loading: true,
        syncStart: Date.now(),
        connections: [],
        syncEnd: null,
        syncError: null,
      },
    });
    try {
      await fetchConnectionsList();

      setState({
        state,
        payload: {
          loading: false,
          syncEnd: Date.now(),
          synced: true,
        },
      });

      await client.syncRecord.create.mutate({
        syncStart: msToS(state.syncStart),
        syncEnd: msToS(state.syncEnd),
        syncSuccess: true,
        syncErrorMessage: null,
        startCount: state.startCount,
        endCount: state.connections.length,
      });
    } catch (error: any) {
      await client.syncRecord.create.mutate({
        syncStart: msToS(state.syncStart),
        syncEnd: msToS(Date.now()),
        syncSuccess: false,
        syncErrorMessage: error.message,
        startCount: state.startCount,
        endCount: 0,
      });

      setState({
        state,
        payload: {
          loading: false,
          synced: false,
          syncError: error.message,
        },
      });
    }
  }
};

const setState = ({ state, payload }: ISetState) => {
  Object.assign(state, payload);
  chrome.storage.local.set(state);
};

const fetchCookies = () => {
  return chrome.cookies.getAll({ domain: "linkedin.com" });
};

const fetchLatestSyncState = async () => {
  const latest = await client.syncRecord.getLatest.query();
  return latest;
};

interface LinkedInIncludedResponse {
  entityUrn: string;
}

interface LinkedInIncludedConnectionResponse extends LinkedInIncludedResponse {
  connectedMember: string;
  createdAt: number;
}

interface LinkedInIncludedUserResponse extends LinkedInIncludedResponse {
  firstName: string;
  headline: string;
  lastName: string;
  memorialized: boolean;
  publicIdentifier: string;
  profilePicture: {};
}

export const schema = z.object({
  lastName: z.string(),
  memorialized: z.boolean(),
  // $anti_abuse_metadata: z.object({
  $recipeTypes: z.array(z.string()),
  $type: z.string(),
  firstName: z.string(),
  profilePicture: z.object({
    // displayImageWithFrameReferenceUnion: z.object({
    //   vectorImage: z.object({
    //     $recipeTypes: z.array(z.string()),
    //     rootUrl: z.string(),
    //     artifacts: z.array(
    //       z.object({
    //         width: z.number(),
    //         $recipeTypes: z.array(z.string()),
    //         fileIdentifyingUrlPathSegment: z.string(),
    //         expiresAt: z.number(),
    //         height: z.number(),
    //         $type: z.string()
    //       })
    //     ),
    //     $type: z.string()
    //   })
    // }),
    a11yText: z.string(),
    displayImageReference: z.object({
      vectorImage: z.object({
        $recipeTypes: z.array(z.string()),
        rootUrl: z.string(),
        artifacts: z.array(
          z.object({
            width: z.number(),
            $recipeTypes: z.array(z.string()),
            fileIdentifyingUrlPathSegment: z.string(),
            expiresAt: z.number(),
            height: z.number(),
            $type: z.string(),
          })
        ),
        $type: z.string(),
      }),
    }),
    frameType: z.string(),
    $recipeTypes: z.array(z.string()),
    displayImageUrn: z.string(),
    $type: z.string(),
  }),
  entityUrn: z.string(),
  headline: z.string(),
  publicIdentifier: z.string(),
});
// })

interface LinkedInConnectionResponse {
  data: any;
  included: Array<LinkedInIncludedConnectionResponse | LinkedInIncludedUserResponse>;
  meta: any;
}

export interface LinkedInIncludedMergedResponse extends LinkedInIncludedResponse {
  firstName: string;
  headline: string;
  lastName: string;
  memorialized: boolean;
  publicIdentifier: string;
  connectedAt: number;
}

const fetchConnectionsList = async () => {
  const requestInitConfig = createFetchConfigs();

  let start = 0;
  const limit = 40;

  const delayRange = {
    start: 1500,
    end: 3000,
  };

  let newConnections: LinkedInIncludedMergedResponse[] = await fetchConnections({
    start,
    limit,
    requestInitConfig,
  });

  while (newConnections.length > 0) {
    const remaining = Date.now() - state.syncStart;
    if (remaining < delayRange.start) {
      const wait = Math.floor(
        Math.random() * (delayRange.end - delayRange.start) + delayRange.start - remaining
      );
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    newConnections = await fetchConnections({
      start,
      limit,
      requestInitConfig,
    });

    setState({
      state,
      payload: {
        connections: [...state.connections, ...newConnections],
      },
    });

    start += limit;
  }

  return;
};

const fetchConnections = async ({
  start,
  limit,
  requestInitConfig,
}: {
  start: number;
  limit: number;
  requestInitConfig: RequestInit;
}) => {
  const queryString = new URLSearchParams({
    decorationId: "com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16",
    count: limit.toString(),
    q: "search",
    sortType: "RECENTLY_ADDED",
    start: start.toString(),
  });

  const url = `https://www.linkedin.com/voyager/api/relationships/dash/connections?${queryString}`;

  const response = await fetch(url, requestInitConfig);

  if (!response.ok) throw new Error(`${response.status} - ${response.statusText}`);

  const data: LinkedInConnectionResponse = await response.json();

  const usersIncludeConnections = parseConnectionList(data);

  await client.connection.upsertMany.mutate(usersIncludeConnections);

  return usersIncludeConnections;
};

const parseConnectionList = ({ included }: LinkedInConnectionResponse) => {
  const users = included
    .filter((item): item is LinkedInIncludedUserResponse => {
      return (item as LinkedInIncludedUserResponse).entityUrn.includes("urn:li:fsd_profile");
    })
    .map((_item: LinkedInIncludedUserResponse) => {
      console.log(_item);
      const item = schema.parse(_item);

      const imageUrl =
        item.profilePicture.displayImageReference.vectorImage +
        item.profilePicture.displayImageReference.vectorImage.artifacts[0]
          .fileIdentifyingUrlPathSegment;
      return {
        entityUrn: _item.entityUrn,
        firstName: _item.firstName,
        headline: _item.headline,
        lastName: _item.lastName,
        memorialized: _item.memorialized,
        publicIdentifier: _item.publicIdentifier,
        profilePicture: imageUrl,
      };
      // { entityUrn, firstName, headline, lastName, memorialized, publicIdentifier
      // profilePicture: { displayImageReference: { vectorImage: { rootUrl, artifacts } } }
      // }) => ({
      //   entityUrn,
      //   firstName,
      //   headline,
      //   lastName,
      //   memorialized,
      //   publicIdentifier,
      // }));
    });

  const connections = included
    .filter(({ entityUrn }) => entityUrn.includes("urn:li:fsd_connection"))
    .filter((item): item is LinkedInIncludedConnectionResponse => {
      return (item as LinkedInIncludedConnectionResponse).entityUrn.includes(
        "urn:li:fsd_connection"
      );
    });

  const usersIncludeConnections = users.map((user) => {
    console.log(user);
    let connection = connections.find(
      (connection) => connection.connectedMember === user.entityUrn
    );

    if (!connection) return;
    console.log(connection);
    return {
      ...user,
      connectedAt: msToS(connection.createdAt),
    };
  });

  function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }

  return usersIncludeConnections.filter(notEmpty);
};
