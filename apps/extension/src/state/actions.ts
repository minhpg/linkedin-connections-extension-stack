import { ExtensionStateProxy, state } from "./extensionState";

export enum StateActions {
  FetchConnectionList = "fetch-connection-list",
  FetchCookie = "fetch-cookie",
  FetchLatestSyncState = "fetch-latest-sync-state",
  SetState = "set-state",
  GetState = "get-state",
}

export type SetStatePayload<T extends {} = {}> = {
  [Key in keyof T]: Extract<ExtensionStateProxy, T[Key]>;
};

export interface ISetState {
  state: ExtensionStateProxy;
  payload: SetStatePayload;
}

export const fetchConnectionsList = () => {
  chrome.runtime.sendMessage({ type: StateActions.FetchConnectionList });
};

export const fetchCookies = () => {
  chrome.runtime.sendMessage({ type: StateActions.FetchCookie });
};

export const fetchLatestSyncState = () => {
  chrome.runtime.sendMessage({ type: StateActions.FetchLatestSyncState });
};

export const setState = (payload: SetStatePayload) => {
  chrome.runtime.sendMessage({ type: StateActions.SetState, payload });
};

export const getAuthToken = () => {
  return state.token;
};
