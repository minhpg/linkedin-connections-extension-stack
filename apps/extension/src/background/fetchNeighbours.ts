import { RiUserLine } from "@remixicon/react";
import { createFetchConfigs, defaultHeaders } from "./fetchDefaults";

type Depth = "F" | "S" | "O";
const limit = 100;
const count = 12;
const start = 0;
// type Response {
//   data: {
//     data: {
//       searchDashClustersByAll: {
//         metadata: {
//           totalResultCount: number,
//         }
//       }
//     }
//   }
//   included:{
//     template :"UNIVERSAL",
//     // TODO

//   } []

// }

export async function getConnections(_urn_id: string, depth: Depth[] = ["F"]) {
  // https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359
  // https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:MEMBER_PROFILE_CANNED_SEARCH,query:  (flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.806ff371aaae722f7d7ecee7a3e83900
  const urn_id = "ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4";
  // https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(start:0,origin:MEMBER_PROFILE_CANNED_SEARCH,query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359&origin=MEMBER_PROFILE_CANNED_SEARCH&start=0&count=12
  // https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&
  // variables=(start:0,count:10,origin:MEMBER_PROFILE_CANNED_SEARCH,query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359&origin=MEMBER_PROFILE_CANNED_SEARCH

  // https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:MEMBER_PROFILE_CANNED_SEARCH,query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashFilterClusters.e5b7959b8850da8ff7124e3d6c976359
  const rliQueries = {
    // increment this
    start: 0,
    // count default is 10
    // count: 10,
    origin: "MEMBER_PROFILE_CANNED_SEARCH",
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
      includeFiltersInResponse: false,
    },
  };
  const queryParams = {
    // includeWebMetadata: "true",
    variables: jsToRestli(rliQueries),
    queryId: "voyagerSearchDashClusters.806ff371aaae722f7d7ecee7a3e83900",
    // origin: "MEMBER_PROFILE_CANNED_SEARCH",
    // start: start.toString(),
    // count: count.toString(),
  };

  const fetch_params = {
    // referrer: encodeURI(
    //   `https://www.linkedin.com/search/results/people/?connectionOf=["${urn_id}"]&network=[${depth.toString()}]&origin=${queryParams.origin}`,
    // ),
    referrer: "https://www.linkedin.com/mynetwork/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  } as const;

  debugger;
  const a = await fetch(
    `https://www.linkedin.com/voyager/api/graphql?${Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&")}`,
    // "https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:MEMBER_PROFILE_CANNED_SEARCH,query:(flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:connectionOf,value:List(ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4)),(key:network,value:List(F,S)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.806ff371aaae722f7d7ecee7a3e83900",

    {
      headers: defaultHeaders,
      ...createFetchConfigs(),
      ...fetch_params,
    },
  );
  console.log(a);
  const data = await a.json();
  debugger;
  console.log(data);

  return data;
}

export function jsToRestli(obj: any /*Record<string, object*/): string {
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
