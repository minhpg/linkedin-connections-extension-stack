import { RiUserLine } from "@remixicon/react";
import { createFetchConfigs, defaultHeaders } from "./fetchDefaults";

type Depth = "F" | "S" | "O";
const limit = 100;
const start = 0;
export async function getConnections(urn_id: string, depth: Depth[] = ["F"]) {
  // https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359

  const rliQueries = {
    query: {
      flagshipSearchIntent: "SEARCH_SRP",
      queryParameters: [
        {
          key: "connectionOf",
          value: [urn_id],
        },
        { key: "network", value: depth },
        { key: "resultType", value: ["PEOPLE"] },
      ],
    },
  };
  const queryParams = {
    includeWebMetadata: "true",
    variables: jsToRestli(rliQueries),
    queryId: "voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359",
    origin: "MEMBER_PROFILE_CANNED_SEARCH",
    // q: "search", // can be all
    // may need start
  };

  // const queryString = new URLSearchParams({
  //   includeWebMetadata: "true",
  //   decorationId:
  //     "com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16",
  //   count: limit.toString(),
  //   q: "search",
  //   sortType: "RECENTLY_ADDED",
  //   start: start.toString(),
  //   origin: "MEMBER_PROFILE_CANNED_SEARCH",
  //   filters: `List(${filters.join(",")}`,
  //   // filter
  // }).toString();

  // const referrerParams = Object.fromEntries(
  //   queryParameters.map((item) => [item.key, item.value]),
  // );

  // return `https://www.linkedin.com/search/results/people/?${new URLSearchParams(referrerParams).toString()}`;
  // );
  // const referredParams = {
  //   referrerPolicy: "strict-origin-when-cross-origin",
  //   origin: queryParams.origin,
  // };
  // https://www.linkedin.com/search/results/people/?connectionOf=["ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME"]&network=["F","S"]&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=~zu
  // const base ="https://www.linkedin.com/search/results/people/?connectionOf="
  debugger;
  const fetch_params = {
    referrer: encodeURI(
      `https://www.linkedin.com/search/results/people/?connectionOf=["${urn_id}"]&network=[${depth.toString()}]&origin=${queryParams.origin}`,
    ),
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  } as const;

  const a = await fetch(
    // "https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359",
    `https://www.linkedin.com/voyager/api/graphql?${new URLSearchParams(queryParams).toString()}`,
    {
      headers: defaultHeaders,
      // ...createFetchConfigs(),
      ...fetch_params,
    },
  );
  const data = await a.json();
  console.log(data);
  return data;
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
