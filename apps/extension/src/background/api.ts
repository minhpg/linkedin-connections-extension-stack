import { state } from "../state/extensionState";
import { client } from "../trpc/trpcClient";
import { msToS } from "../utils/msToS";
import { notEmpty } from "../utils/notEmpty";
import { setState } from "./background";
import { createFetchConfigs } from "./fetchDefaults";

export interface LinkedInEntityResponse {
  entityUrn: string;
}

export interface LinkedInIncludedConnectionResponse
  extends LinkedInEntityResponse {
  connectedMember: string;
  createdAt: number;
}

export interface LinkedInIncludedUserResponse extends LinkedInEntityResponse {
  firstName: string;
  headline: string;
  lastName: string;
  memorialized: boolean;
  publicIdentifier: string;
  profilePicture?: {
    displayImageReference: {
      vectorImage: {
        rootUrl: string;
        artifacts: {
          width: number;
          fileIdentifyingUrlPathSegment: string;
          expiresAt: number;
          height: number;
        }[];
      };
    };
  };
}

export interface LinkedInUser extends LinkedInEntityResponse {
  firstName: string;
  headline: string;
  lastName: string;
  memorialized: boolean;
  publicIdentifier: string;
  profilePicture?: string | null;
}

export interface LinkedInConnection
  extends Omit<LinkedInEntityResponse, "entityUrn"> {
  entityUrn?: string | null;
  from: LinkedInUser;
  to: LinkedInUser;
  connectedAt?: number;
}

export interface LinkedInConnectionResponse {
  data: any;
  included: Array<
    LinkedInIncludedConnectionResponse | LinkedInIncludedUserResponse
  >;
  meta: any;
}

export interface LinkedInExternalConnectionResponse {
  data: any;
  included: Array<LinkedInEntityResponse | any>;
}

export interface LinkedInIncludedMergedResponse extends LinkedInEntityResponse {
  firstName: string;
  headline: string;
  lastName: string;
  memorialized: boolean;
  publicIdentifier: string;
  profilePicture: string | null;
  connectedAt: number;
}

export async function fetchSelfConnectionsList() {
  const requestInitConfig = createFetchConfigs();

  let start = 0;
  const limit = 40;

  const delayRange = {
    start: 1500,
    end: 3000,
  };

  let newConnections: LinkedInConnection[] = await fetchSelfConnections({
    start,
    limit,
    requestInitConfig,
  });

  while (newConnections.length > 0) {
    const remaining = Date.now() - (state?.syncStart ?? 0);
    if (remaining < delayRange.start) {
      const wait = Math.floor(
        Math.random() * (delayRange.end - delayRange.start) +
          delayRange.start -
          remaining,
      );
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    newConnections = await fetchSelfConnections({
      start,
      limit,
      requestInitConfig,
    });

    setState({
      state,
      payload: {
        connections: state.connections
          ? [...state.connections, ...newConnections]
          : newConnections,
      },
    });

    start += limit;
  }

  return;
}

function parseConnectionList({ included }: LinkedInConnectionResponse) {
  const users: LinkedInUser[] = included
    .filter((item): LinkedInIncludedUserResponse => {
      const user = item as LinkedInIncludedUserResponse;
      // @ts-expect-error
      return (
        !!user.publicIdentifier && user.entityUrn.includes("urn:li:fsd_profile")
      );
    })
    .map((item) => {
      const {
        entityUrn,
        firstName,
        headline,
        lastName,
        memorialized,
        publicIdentifier,
        profilePicture,
      } = item as LinkedInIncludedUserResponse;

      let imageUrl;

      if (profilePicture) {
        imageUrl =
          profilePicture.displayImageReference.vectorImage.rootUrl +
          profilePicture.displayImageReference.vectorImage.artifacts[
            profilePicture.displayImageReference.vectorImage.artifacts.length -
              1
          ].fileIdentifyingUrlPathSegment;
      }

      return {
        entityUrn,
        firstName,
        headline,
        lastName,
        memorialized,
        publicIdentifier,
        profilePicture: imageUrl,
      };
    });

  const connections: LinkedInConnection[] = included
    .filter((item): item is LinkedInIncludedConnectionResponse => {
      return (item as LinkedInIncludedConnectionResponse).entityUrn.includes(
        "urn:li:fsd_connection",
      );
    })
    .map(({ entityUrn, connectedMember, createdAt }) => {
      const connectedUser: LinkedInUser | undefined = users.find(
        ({ entityUrn }) => entityUrn == connectedMember,
      );
      if (connectedUser && state.userLinkedInProfile)
        return {
          entityUrn,
          from: state.userLinkedInProfile,
          to: connectedUser,
          connectedAt: msToS(createdAt),
        };
    })
    .filter(notEmpty);

  return {
    users,
    connections,
  };
}

async function fetchSelfConnections({
  start,
  limit,
  requestInitConfig,
}: {
  start: number;
  limit: number;
  requestInitConfig: RequestInit;
}): Promise<LinkedInConnection[]> {
  const queryString = new URLSearchParams({
    decorationId:
      "com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16",
    count: limit.toString(),
    q: "search",
    sortType: "RECENTLY_ADDED",
    start: start.toString(),
  }).toString();

  const url = `https://www.linkedin.com/voyager/api/relationships/dash/connections?${queryString}`;

  const response = await fetch(url, {
    ...requestInitConfig,
    referrer: "https://www.linkedin.com/mynetwork/",
  });

  if (!response.ok)
    throw new Error(`${response.status} - ${response.statusText}`);

  const data = (await response.json()) as LinkedInConnectionResponse;

  const { users, connections } = parseConnectionList(data);

  await client.connection.upsertUserProfiles.mutate(users);
  await client.connection.upsertUserConnections.mutate(connections);

  return connections;
}

export async function fetchSelfEntityURN() {
  const url = `https://www.linkedin.com/`;

  const response = await fetch(url, createFetchConfigs());

  if (!response.ok)
    throw new Error(`${response.status} - ${response.statusText}`);

  const text = await response.text();

  const urnMatch = text.match(/&quot;urn:li:fsd_profile:[a-zA-Z0-9_]*&quot;/g);
  if (!urnMatch) return;
  return urnMatch[0].replace(/&quot;/g, "");
}

export interface LinkedInDataProfileResponse {
  data: LinkedInIncludedUserResponse;
  included: [];
}

export async function fetchSelfProfile() {
  const entityUrn = await fetchSelfEntityURN();
  if (!entityUrn) return;

  const queryString = new URLSearchParams({
    decorationId:
      "com.linkedin.voyager.dash.deco.identity.profile.FullProfile-76",
  }).toString();

  const url = `https://www.linkedin.com/voyager/api/identity/dash/profiles/${entityUrn}?${queryString}`;

  const response = await fetch(url, createFetchConfigs());

  if (!response.ok)
    throw new Error(`${response.status} - ${response.statusText}`);

  const linkedInProfileRes: LinkedInDataProfileResponse = await response.json();

  /** Parse user profile response */
  const {
    data: {
      firstName,
      headline,
      lastName,
      memorialized,
      publicIdentifier,
      profilePicture,
    },
  } = linkedInProfileRes;

  let imageUrl;

  if (profilePicture) {
    imageUrl =
      profilePicture.displayImageReference.vectorImage.rootUrl +
      profilePicture.displayImageReference.vectorImage.artifacts[
        profilePicture.displayImageReference.vectorImage.artifacts.length - 1
      ].fileIdentifyingUrlPathSegment;
  }

  const userProfileCleaned: LinkedInUser = {
    entityUrn,
    firstName,
    headline,
    lastName,
    memorialized,
    publicIdentifier,
    profilePicture: imageUrl,
  };

  await client.connection.upsertSelfProfile.mutate(userProfileCleaned);

  return userProfileCleaned;
}

export async function fetchUserProfile({ entityUrn }: { entityUrn: string }) {
  const queryString = new URLSearchParams({
    decorationId:
      "com.linkedin.voyager.dash.deco.identity.profile.FullProfile-76",
  }).toString();

  const url = `https://www.linkedin.com/voyager/api/identity/dash/profiles/${entityUrn}?${queryString}`;

  const response = await fetch(url, createFetchConfigs());

  if (!response.ok)
    throw new Error(`${response.status} - ${response.statusText}`);

  const linkedInProfileRes: LinkedInDataProfileResponse = await response.json();

  /** Parse user profile response */
  const {
    data: {
      firstName,
      headline,
      lastName,
      memorialized,
      publicIdentifier,
      profilePicture,
    },
  } = linkedInProfileRes;

  let imageUrl;

  if (profilePicture) {
    imageUrl =
      profilePicture.displayImageReference.vectorImage.rootUrl +
      profilePicture.displayImageReference.vectorImage.artifacts[
        profilePicture.displayImageReference.vectorImage.artifacts.length - 1
      ].fileIdentifyingUrlPathSegment;
  }

  const userProfileCleaned: LinkedInUser = {
    entityUrn,
    firstName,
    headline,
    lastName,
    memorialized,
    publicIdentifier,
    profilePicture: imageUrl,
  };

  await client.connection.upsertUserProfile.mutate(userProfileCleaned);

  return userProfileCleaned;
}

export async function fetchUserConnections({
  start,
  userProfile,
}: {
  start: number;
  userProfile: LinkedInUser;
}) {
  const fetchConfigs = createFetchConfigs();

  const variables = `(start:${start.toString()},origin:MEMBER_PROFILE_CANNED_SEARCH,query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(${userProfile.entityUrn.replace("urn:li:fsd_profile:", "")})),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))`;
  let queryString = `variables=${variables}&queryId=voyagerSearchDashClusters.6ff214518a6e07864377c1d933593f4c`;
  let url = `https://www.linkedin.com/voyager/api/graphql?${queryString}`;

  let connectionFetchResponse = await fetch(url, fetchConfigs);

  if (!connectionFetchResponse.ok)
    throw new Error(
      `${connectionFetchResponse.status} - ${connectionFetchResponse.statusText}`,
    );

  const connectionsRes: LinkedInExternalConnectionResponse =
    await connectionFetchResponse.json();

  console.log(connectionsRes);

  const generateLazyLoadParams = (arr: LinkedInExternalConnectionResponse) => {
    return `(lazyLoadedActionsUrns:List(${arr.included
      .filter((item) =>
        item.entityUrn.includes(
          `urn:li:fsd_lazyLoadedActions:(urn:li:fsd_profileActions:`,
        ),
      )
      .map((item) => escape(item.entityUrn))
      .join(",")}))`;
  };

  const lazyloadedActionVariables = generateLazyLoadParams(connectionsRes);

  const lazyLoadQueryString = `variables=${lazyloadedActionVariables}&queryId=voyagerSearchDashLazyLoadedActions.805d3430ded0f28feeae5a3cbd74820b`;

  const lazyLoadFetchResponse = await fetch(
    `https://www.linkedin.com/voyager/api/graphql?${lazyLoadQueryString}`,
    fetchConfigs,
  );

  if (!lazyLoadFetchResponse.ok)
    throw new Error(
      `${lazyLoadFetchResponse.status} - ${lazyLoadFetchResponse.statusText}`,
    );

  const lazyLoadResponse: LinkedInConnectionResponse =
    await lazyLoadFetchResponse.json();

  console.log(lazyLoadResponse);

  const { users } = parseConnectionList(lazyLoadResponse);

  /** Since we do not have the first connected timestamp, we will still create connection (connectedAt=null, entityUrn=...) */
  const connections: LinkedInConnection[] = users.map((user) => {
    return {
      from: userProfile,
      to: user,
    };
  });

  await client.connection.upsertUserProfiles.mutate(users);
  await client.connection.upsertUserConnections.mutate(connections);

  return {
    users,
    connections,
  };
}

export async function initiateSecondarySync() {

  if(!state.userLinkedInProfile) return;

  let latestSecondarySync =
    await client.secondarySyncRecord.getLatestPending.query();

  console.log("looking for latest sync state", latestSecondarySync);

  let userProfile: LinkedInUser;
  let syncTotal = 0;
  let syncStartPos = 0;

  if (!latestSecondarySync) {
    const unsyncedUser =
      await client.secondarySyncRecord.getUnsyncedUser.query(state.userLinkedInProfile);
    console.log("no sync state found. finding new user to sync", unsyncedUser);
    if (!unsyncedUser) return;
    userProfile = unsyncedUser;
    syncTotal = 0;
  } else {
    userProfile = latestSecondarySync.linkedInUser;
    syncTotal = latestSecondarySync.syncTotal
      ? latestSecondarySync.syncTotal
      : 0;
     syncStartPos = latestSecondarySync.syncStartPos? latestSecondarySync.syncStartPos: 0
  }

  const syncStart = msToS(Date.now());
  console.log("sync starts at", syncStart);

  try {
    const { connections, users } = await fetchUserConnections({
      start: syncStartPos,
      userProfile,
    });

    console.log(`found ${connections.length} connections`);
    console.log(connections, users);
    if (connections.length == 0) {
      console.log(`no new connections - sync completed`);
      await client.secondarySyncRecord.upsertRecord.mutate({
        linkedInUser: userProfile,
        syncStartPos: syncStartPos+connections.length,
        syncStart,
        syncInProgress: false,
        syncSuccess: true,
        syncErrorMessage: null,
        syncTotal: syncTotal + connections.length,
      });
      return;
    }

    console.log(`confirm syncing state`);
    await client.secondarySyncRecord.upsertRecord.mutate({
      linkedInUser: userProfile,
      syncStartPos: syncStartPos+connections.length,
      syncStart,
      syncInProgress: true,
      syncSuccess: false,
      syncErrorMessage: null,
      syncTotal: syncTotal + connections.length,
    });
    return;
  } catch (error: any) {
    console.log(`error`, error);
    await client.secondarySyncRecord.upsertRecord.mutate({
      linkedInUser: userProfile,
      syncStartPos,
      syncStart,
      syncInProgress: false,
      syncSuccess: false,
      syncErrorMessage: error.message,
    });
    return;
  }
}
