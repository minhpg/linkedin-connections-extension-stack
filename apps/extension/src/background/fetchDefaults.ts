import { state } from "../state/extensionState";

export const defaultHeaders = {
  accept: "application/vnd.linkedin.normalized+json+2.1",
  "accept-language":
    "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,ko;q=0.4",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-ch-ua":
    '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-li-lang": "en_US",
//   "x-li-page-instance":
//     "urn:li:page:d_flagship3_people_connections;BkJBGaizSEeqh5gsfTREPQ==",
  "x-li-track":
    '{"clientVersion":"1.13.11901","mpVersion":"1.13.11901","osName":"web","timezoneOffset":11,"timezone":"Australia/Melbourne","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":2,"displayWidth":3360,"displayHeight":2100}',
  "x-restli-protocol-version": "2.0.0",
};

export const fetchSettings = {
  referrer: "https://www.linkedin.com/mynetwork/",
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

  console.log(state.cookies);

  const crsfTokenCookie = state.cookies.find(
    (cookie: chrome.cookies.Cookie) =>
      cookie.name == "JSESSIONID" && cookie.domain.includes("www.linkedin.com")
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
