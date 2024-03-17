import { state } from "../state/extensionState";

export const defaultHeaders = {
  accept: "application/vnd.linkedin.normalized+json+2.1",
  "accept-language":
    "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,ko;q=0.4",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "x-restli-protocol-version": "2.0.0",
};

export const fetchSettings = {
  referrerPolicy: "strict-origin-when-cross-origin",
  method: "GET",
  mode: "cors",
  credentials: "include",
};

export const createFetchConfigs = (): RequestInit => {
  if (!state.cookies)
    return {
      headers: defaultHeaders,
      ...fetchSettings,
    } as RequestInit;

  const crsfTokenCookie = state.cookies.find(
    (cookie: chrome.cookies.Cookie) =>
      cookie.name == "JSESSIONID" && cookie.domain.includes("www.linkedin.com"),
  );

  if (!crsfTokenCookie)
    return {
      headers: defaultHeaders,
      ...fetchSettings,
    } as RequestInit;

  const crsfToken = crsfTokenCookie.value.replace(/"/g, "");

  return {
    cookies: state.cookies as chrome.cookies.Cookie[],
    headers: {
      ...defaultHeaders,
      "csrf-token": crsfToken,
    },
    ...fetchSettings,
  } as RequestInit;
};
