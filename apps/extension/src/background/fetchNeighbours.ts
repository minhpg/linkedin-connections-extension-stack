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
  const test_ids = [
    "ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4",
    "ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4",
  ] as const;
  const urn_id = test_ids[1];
  const rliQueries = {
    // increment this
    start: 100,
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
  // const search
  const queryParams = {
    // includeWebMetadata: "true",
    variables: jsToRestli(rliQueries),
    //this searchDashCluster seems to work for people in my network
    // need to test it more
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
