import { state } from "../state/extensionState";
import { client } from "../trpc/trpcClient";
import { msToS } from "../utils/msToS";
import {
  LinkedInUser,
  fetchSelfConnections,
  fetchUserConnections,
  fetchUserProfile,
} from "./api";
import { setState } from "./background";
import { DELAY_RANGE, LINKEDIN_SELF_CONNECTIONS_FETCH_LIMIT } from "./const";
import { createFetchConfigs } from "./fetchDefaults";

export async function delay() {
  const remaining = Date.now() - (state?.syncStart ?? 0);
  if (remaining < DELAY_RANGE.start) {
    const wait = Math.floor(
      Math.random() * (DELAY_RANGE.end - DELAY_RANGE.start) +
        DELAY_RANGE.start -
        remaining,
    );
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

export async function initiatePrimarySync() {
  const requestInitConfig = createFetchConfigs();

  let start = 0;
  const limit = LINKEDIN_SELF_CONNECTIONS_FETCH_LIMIT;

  let { users, connections } = await fetchSelfConnections({
    start,
    limit,
    requestInitConfig,
  });

  while (connections.length > 0) {
    await delay();
    const data = await fetchSelfConnections({
      start,
      limit,
      requestInitConfig,
    });

    connections = data.connections;
    users = data.users;

    await client.connection.upsertUserProfiles.mutate(users);
    await client.connection.upsertUserConnections.mutate(connections);

    setState({
      state,
      payload: {
        connections: state.connections
          ? [...state.connections, ...connections]
          : connections,
      },
    });

    start += limit;
  }

  return;
}

export async function initiateSecondarySync() {
  if (!state.userLinkedInProfile) return;

  let latestSecondarySync =
    await client.secondarySyncRecord.getLatestPending.query();

  let userProfile: LinkedInUser;
  let syncTotal = 0;
  let syncStartPos = 0;

  if (!latestSecondarySync) {
    const unsyncedUser = await client.secondarySyncRecord.getUnsyncedUser.query(
      state.userLinkedInProfile,
    );
    if (!unsyncedUser) return;
    userProfile = unsyncedUser;
    syncTotal = 0;
  } else {
    userProfile = latestSecondarySync.linkedInUser;
    syncTotal = latestSecondarySync.syncTotal
      ? latestSecondarySync.syncTotal
      : 0;
    syncStartPos = latestSecondarySync.syncStartPos
      ? latestSecondarySync.syncStartPos
      : 0;
  }

  const syncStart = msToS(Date.now());

  try {
    const { connections, users } = await fetchUserConnections({
      start: syncStartPos,
      userProfile,
    });

    if (connections.length == 0) {
      await client.secondarySyncRecord.upsertRecord.mutate({
        linkedInUser: userProfile,
        syncStartPos: syncStartPos + connections.length,
        syncStart,
        syncInProgress: false,
        syncSuccess: true,
        syncErrorMessage: null,
        syncTotal: syncTotal + connections.length,
      });
      return;
    }

    await client.connection.upsertUserProfiles.mutate(users);
    await client.connection.upsertUserConnections.mutate(connections);
    await client.secondarySyncRecord.upsertRecord.mutate({
      linkedInUser: userProfile,
      syncStartPos: syncStartPos + connections.length,
      syncStart,
      syncInProgress: true,
      syncSuccess: false,
      syncErrorMessage: null,
      syncTotal: syncTotal + connections.length,
    });
    return;
  } catch (error: any) {
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

export async function hydrateUserProfiles() {
  const dehydratedUserProfiles =
    await client.connection.getDehydratedUserProfiles.query();
  const userProfiles = await Promise.all(
    dehydratedUserProfiles.map((userProfile) =>
      fetchUserProfile({ entityUrn: userProfile.entityUrn }),
    ),
  );
  await client.connection.upsertUserProfiles.mutate(userProfiles);
}
