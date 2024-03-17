import { state } from "../state/extensionState";
import { client } from "../trpc/trpcClient";
import { msToS } from "../utils/msToS";
import {
  LinkedInUser,
  fetchSelfConnections,
  fetchUserConnections,
} from "./api";
import { setState } from "./background";
import { createFetchConfigs } from "./fetchDefaults";

export async function initiatePrimarySync() {
  const requestInitConfig = createFetchConfigs();

  let start = 0;
  const limit = 40;

  const delayRange = {
    start: 1500,
    end: 3000,
  };

  let { users, connections } = await fetchSelfConnections({
    start,
    limit,
    requestInitConfig,
  });

  while (connections.length > 0) {
    const remaining = Date.now() - (state?.syncStart ?? 0);
    if (remaining < delayRange.start) {
      const wait = Math.floor(
        Math.random() * (delayRange.end - delayRange.start) +
          delayRange.start -
          remaining,
      );
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

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


