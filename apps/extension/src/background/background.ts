import { StateActions, ISetState, SetStatePayload } from "../state/actions";
import { state } from "../state/extensionState";
import { client } from "../trpc/trpcClient";
import { msToS } from "../utils/msToS";
import { fetchSelfProfile, fetchUserProfile } from "./api";
import {
  hydrateUserProfiles,
  initiatePrimarySync,
  initiateSecondarySync,
} from "./backgroundActions";

type Message = { type: StateActions; payload: SetStatePayload };
chrome.runtime.onInstalled.addListener(async () => {
  /* Initialize storage with state */
  chrome.storage.local.set(state).catch(console.error);

  /* Add message listener */
  chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
    dispatchActions(message, _, sendResponse).catch(console.error);
    return true;
  });

  /** Register alarm for auto syncing */
  await chrome.alarms.create("auto-sync", {
    delayInMinutes: 0,
    periodInMinutes: 30,
  });

  await chrome.alarms.create("secondary-auto-sync", {
    delayInMinutes: 0,
    periodInMinutes: 0.5,
  });

  await chrome.alarms.create("hydrate-profiles-auto-sync", {
    delayInMinutes: 0,
    periodInMinutes: 0.5,
  });

  /** Chrome alarm listener for auto syncing */
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (state.token && state.cookies) {
      if (
        alarm.name == "secondary-auto-sync" &&
        state.secondarySyncing == false
      ) {
        setState({
          state,
          payload: {
            secondarySyncing: true,
          },
        });
        if (state.userLinkedInProfile) {
          await initiateSecondarySync();
        }
        setState({
          state,
          payload: {
            secondarySyncing: false,
          },
        });
      }
      if(alarm.name == "secondary-auto-sync"){
        await hydrateUserProfiles();
      }
      if (alarm.name == "auto-sync") {
        const syncState = await fetchLatestSyncState();
        if (syncState) {
          const { syncEnd, endCount } = syncState;
          setState({
            state,
            payload: {
              syncEnd: syncEnd * 1000,
              startCount: endCount,
            },
          });
        }

        const cookies = await fetchCookies();
        setState({
          state,
          payload: {
            cookies,
            syncStart: Date.now(),
            connections: [],
            syncEnd: null,
            syncError: null,
          },
        });

        try {
          await initiatePrimarySync();
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
            endCount: state.connections?.length ?? -1,
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
    }
  });
});

/* Handle state dispatch */
const dispatchActions = async (
  message: Message,
  _: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
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

    const userLinkedInProfile = await fetchSelfProfile();
    if (userLinkedInProfile)
      await client.connection.upsertUserProfile.mutate(userLinkedInProfile);
    setState({
      state,
      payload: {
        loading: true,
        userLinkedInProfile,
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
          syncEnd: syncEnd * 1000,
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
      await initiatePrimarySync();

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
        endCount: state.connections?.length ?? -1,
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

  if (message.type == StateActions.RunTestFunction) {
    setState({
      state,
      payload: {
        secondarySyncing: true,
      },
    });

    await hydrateUserProfiles()
    setState({
      state,
      payload: {
        secondarySyncing: false,
      },
    });
  }
};

export const setState = ({ state, payload }: ISetState) => {
  Object.assign(state, payload);
  chrome.storage.local.set(state).catch(console.error);
};

export const fetchCookies = () => {
  return chrome.cookies.getAll({ domain: "linkedin.com" });
};

export const fetchLatestSyncState = async () => {
  const latest = await client.syncRecord.getLatest.query();
  return latest;
};
