import { proxy } from "valtio";
import { LinkedInConnection, LinkedInUser } from "../background/api";

export interface ExtensionStateProxy {
  cookies: chrome.cookies.Cookie[] | null;
  connections: LinkedInConnection[];
  loading: boolean;

  loggedIn: boolean;
  user: User | null;
  userLinkedInProfile: LinkedInUser | null;
  token: string | null;

  synced: boolean;
  syncStart: number | null;
  syncEnd: number | null;
  syncError: string | null;
  startCount: number;

  secondarySyncing: boolean
}

export const state = proxy<ExtensionStateProxy>({
  cookies: null,
  connections: [],
  loading: false,

  loggedIn: false,
  user: null,
  token: null,
  userLinkedInProfile: null,

  synced: false,
  syncStart: 0,
  syncEnd: 0,
  syncError: null,
  startCount: 0,

  secondarySyncing: false
});

export type User = {
  name: string;
  email: string;
  image: string;
};
