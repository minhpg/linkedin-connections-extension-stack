import { ExtensionStateProxy, state } from "./extensionState";

export enum StateActions {
  FetchConnectionList = "fetch-connection-list",
  FetchCookie = "fetch-cookie",
  FetchLatestSyncState = "fetch-latest-sync-state",
  SetState = "set-state",
  GetState = "get-state",
}

// export type SetStatePayload<T extends {}> = {
//   [Key in keyof T]: Extract<ExtensionStateProxy, T[Key]>;
// };
export type SetStatePayload = Partial<ExtensionStateProxy>;

export interface ISetState {
  state: ExtensionStateProxy;
  payload: SetStatePayload;
}

export const fetchConnectionsList = () => {
  chrome.runtime
    .sendMessage({ type: StateActions.FetchConnectionList })
    .catch(console.error);
};

export const fetchCookies = () => {
  chrome.runtime
    .sendMessage({ type: StateActions.FetchCookie })
    .catch(console.error);
};

export const fetchLatestSyncState = () => {
  chrome.runtime
    .sendMessage({ type: StateActions.FetchLatestSyncState })
    .catch(console.error);
};

export const setState = (payload: SetStatePayload) => {
  chrome.runtime
    .sendMessage({ type: StateActions.SetState, payload })
    .catch(console.error);
};

export const getAuthToken = () => {
  return state.token;
};
