import { state } from "../state/extensionState";
import { client } from "../trpc/trpcClient";
import { msToS } from "../utils/msToS";
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
  profilePicture?: string;
}

export interface LinkedInConnection extends LinkedInEntityResponse {
  between: LinkedInUser[];
  connectedAt: number;
}

export interface LinkedInConnectionResponse {
  data: any;
  included: Array<
    LinkedInIncludedConnectionResponse | LinkedInIncludedUserResponse
  >;
  meta: any;
}

export interface LinkedInIncludedMergedResponse extends LinkedInEntityResponse {
  firstName: string;
  headline: string;
  lastName: string;
  memorialized: boolean;
  publicIdentifier: string;
  profilePicture?: string;
  connectedAt: number;
}

export const fetchConnectionsList = async () => {
  const requestInitConfig = createFetchConfigs();

  let start = 0;
  const limit = 40;

  const delayRange = {
    start: 1500,
    end: 3000,
  };

  let newConnections: LinkedInConnection[] = await fetchConnections({
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

    newConnections = await fetchConnections({
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
};

const fetchConnections = async ({
  start,
  limit,
  requestInitConfig,
}: {
  start: number;
  limit: number;
  requestInitConfig: RequestInit;
}): Promise<LinkedInConnection[]> => {
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

  console.log(connections);

  await client.connection.upsertUserProfiles.mutate(users);
  await client.connection.upsertUserConnections.mutate(connections);

  return connections;
};

const parseConnectionList = ({ included }: LinkedInConnectionResponse) => {
  const users: LinkedInUser[] = included
    .filter((item): item is LinkedInIncludedUserResponse => {
      return (item as LinkedInIncludedUserResponse).entityUrn.includes(
        "urn:li:fsd_profile",
      );
    })
    .map(
      ({
        entityUrn,
        firstName,
        headline,
        lastName,
        memorialized,
        publicIdentifier,
        profilePicture,
      }: LinkedInIncludedUserResponse) => {
        let imageUrl;

        if (profilePicture) {
          imageUrl =
            profilePicture.displayImageReference.vectorImage.rootUrl +
            profilePicture.displayImageReference.vectorImage.artifacts[
              profilePicture.displayImageReference.vectorImage.artifacts
                .length - 1
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
      },
    );

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
          between: [state.userLinkedInProfile, connectedUser],
          connectedAt: msToS(createdAt),
        };
    })
    .filter(notEmpty);

  return {
    users,
    connections,
  };
};

export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export function fetchExternalConnections() {}

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

export async function fetchUserProfile() {
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

  await client.connection.upsertUserProfile.mutate(userProfileCleaned);

  return userProfileCleaned;
}
