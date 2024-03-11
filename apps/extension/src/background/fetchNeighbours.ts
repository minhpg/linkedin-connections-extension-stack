import { RiUserLine } from "@remixicon/react";
import { createFetchConfigs, defaultHeaders } from "./fetchDefaults";

type Depth = "F" | "S" | "O";
const limit = 100;
const start = 0;
export function getConnections(urn_id: string, depth: Depth = "F") {
  // filters = ["(key:resultType,value:List(PEOPLE))"]
  const filters = [
    "(key:resultType,value:List(PEOPLE))",
    `(key:connectionOf,value:List(${urn_id}))`,
    `network,value:List(${depth}))`,
  ];
  //
  // const params =
  // const url = `https://www.linkedin.com/voyager/api/relationships/connections?${new URLSearchParams(
  //   params,
  // ).toString()}`;
  const queryString = new URLSearchParams({
    includeWebMetadata: "true",
    decorationId:
      "com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16",
    count: limit.toString(),
    q: "search",
    sortType: "RECENTLY_ADDED",
    start: start.toString(),
    origin: "MEMBER_PROFILE_CANNED_SEARCH",
    filters: `List(${filters.join(",")}`,
    // filter
  }).toString();
  // res = self._fetch(
  //     f"/graphql?variables=(start:{default_params['start']},origin:{default_params['origin']},"
  //     f"query:("
  //     f"{keywords}"
  //     f"flagshipSearchIntent:SEARCH_SRP,"
  //     f"queryParameters:{default_params['filters']},"
  //     f"includeFiltersInResponse:false))&=&queryId=voyagerSearchDashClusters"
  //     f".b0928897b71bd00a5a7291755dcd64f0"
  // )
  // https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359

  const test = fetch(
    "https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359",
    {
      headers: {
        accept: "application/vnd.linkedin.normalized+json+2.1",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "csrf-token": "ajax:2338183475453382724",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-li-lang": "en_US",
        "x-li-page-instance":
          "urn:li:page:d_flagship3_search_srp_people;yr41K/0tQK+feljYVLBpQg==",
        "x-li-pem-metadata":
          "Voyager - People SRP=lazy-loaded-advanced-filters",
        "x-li-track":
          '{"clientVersion":"1.13.12043","mpVersion":"1.13.12043","osName":"web","timezoneOffset":0,"timezone":"Etc/Unknown","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":0.800000011920929,"displayWidth":2048.000030517578,"displayHeight":864.0000128746033}',
        "x-restli-protocol-version": "2.0.0",
      },
      referrer:
        "https://www.linkedin.com/search/results/people/?connectionOf=%5B%22ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME%22%5D&network=%5B%22F%22%2C%22S%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=~zu",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    },
  );
  const aqueries = {
    query: {
      flagshipSearchIntent: "SEARCH_SRP",
      queryParameters: [
        {
          key: "connectionOf",
          value: [urn_id],
        },
        { key: "network", value: [depth] },
        { key: "resultType", value: ["PEOPLE"] },
      ],
    },
  };
  const queryParams = {
    includeWebMetadata: true,
    variables: jsToRestli(aqueries),
    queryId: "voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359",
  };
  // https://www.linkedin.com/search/results/people/?connectionOf=["ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME"]&network=["F","S"]&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=~zu
  // const base ="https://www.linkedin.com/search/results/people/?connectionOf="
  const fetch_params = {
    referrer: encodeURI(
      `https://www.linkedin.com/search/results/people/?connectionOf=["${urn_id}"]&network=["F","S"]&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=~zu`,
    ),
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };

  const a = fetch(
    "https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359",
    {
      headers: defaultHeaders,
      // ...createFetchConfigs(),
      referrer:
        "https://www.linkedin.com/search/results/people/?connectionOf=%5B%22ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME%22%5D&network=%5B%22F%22%2C%22S%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=~zu",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    },
  );
}

export function jsToRestli(obj: Record<string, object>): string {
  const stringified = JSON.stringify(obj);
  const replaced = stringified
    .replace(/\"/g, "")
    .replace(/\{/g, "(")
    .replace(/\}/g, ")")
    .replace(/\[/g, "List(")
    .replace(/\]/g, ")");
  return replaced;
  if (typeof obj !== "object") {
    return obj;
  }
  const keys = Object.keys(obj);
  const result = [];
  for (const key of keys) {
    if (Array.isArray(obj[key])) {
      // check if depth is more than 1
      // if (obj[key].length === 1) {
      //   result.push(`${key}:List(${jsToRestli(obj[key][0])})`);
      // } else {
      result.push(
        `${key}:List(${(obj[key] as Array<any>)
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }
            return `(${jsToRestli(item)})`;
          })
          .join(",")})`,
      );
      // }
    } else if (typeof obj[key] === "string") {
      result.push(`${key}:${obj[key]}`);
    } else if (typeof obj[key] === "object") {
      // join all keys
      result.push(`(${key}:(${jsToRestli(obj[key])}))`);
      // result+=`(${obj[key]})`
    } else {
      result.push(`${key}:${obj[key]}`);
    }
  }

  return result.join(",");
}
