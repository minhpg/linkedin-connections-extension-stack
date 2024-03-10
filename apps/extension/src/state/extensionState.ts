import { proxy } from "valtio";
import { LinkedInIncludedMergedResponse } from "../background/background";

export interface ExtensionStateProxy {
  cookies: chrome.cookies.Cookie[] | null;
  connections: LinkedInIncludedMergedResponse[] | null;
  loading: boolean;

  loggedIn: boolean;
  user: User | null;
  token: string | null;

  synced: boolean;
  syncStart: number | null;
  syncEnd: number | null;
  syncError: string | null;
  startCount: number;
}

export const state = proxy<ExtensionStateProxy>({
  cookies: null,
  connections: [],
  loading: false,

  loggedIn: false,
  user: null,
  token: null,

  synced: false,
  syncStart: 0,
  syncEnd: 0,
  syncError: null,
  startCount: 0,
});

export type User = {
  name: string;
  email: string;
  image: string;
};
