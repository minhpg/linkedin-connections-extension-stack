import { state } from "../state/extensionState";
import { msToS } from "../utils/msToS";
import { notEmpty } from "../utils/notEmpty";
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

export interface LinkedInDataProfileResponse {
  data: LinkedInIncludedUserResponse;
  included: [];
}

export function parseConnectionList({ included }: LinkedInConnectionResponse) {
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

export async function fetchSelfConnections({
  start,
  limit,
  requestInitConfig,
}: {
  start: number;
  limit: number;
  requestInitConfig: RequestInit;
}) {
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

  return {
    users,
    connections,
  };
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

export function getProfilePictureUrl(
  profilePicture: LinkedInIncludedUserResponse["profilePicture"],
) {
  if (!profilePicture) return;
  if (!profilePicture.displayImageReference) return;
  return (
    profilePicture.displayImageReference.vectorImage.rootUrl +
    profilePicture.displayImageReference.vectorImage.artifacts[
      profilePicture.displayImageReference.vectorImage.artifacts.length - 1
    ].fileIdentifyingUrlPathSegment
  );
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

  const imageUrl = getProfilePictureUrl(profilePicture);

  const userProfileCleaned: LinkedInUser = {
    entityUrn,
    firstName,
    headline,
    lastName,
    memorialized,
    publicIdentifier,
    profilePicture: imageUrl,
  };

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

  const imageUrl = getProfilePictureUrl(profilePicture);

  const userProfileCleaned: LinkedInUser = {
    entityUrn,
    firstName,
    headline,
    lastName,
    memorialized,
    publicIdentifier,
    profilePicture: imageUrl,
  };

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

  const { users } = parseConnectionList(lazyLoadResponse);

  /** Since we do not have the first connected timestamp, we will still create connection (connectedAt=null, entityUrn=...) */
  const connections: LinkedInConnection[] = users.map((user) => {
    return {
      from: userProfile,
      to: user,
    };
  });

  return {
    users,
    connections,
  };
}
