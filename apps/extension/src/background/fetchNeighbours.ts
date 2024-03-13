import { RiUserLine } from "@remixicon/react";
import { persist, createJSONStorage } from "zustand/middleware";
import { createFetchConfigs, defaultHeaders } from "./fetchDefaults";
import { create } from "zustand";
import { LItem, LiNResponse, Depth } from "../state/resumable";
import { client } from "../trpc/trpcClient";
import { state } from "../state/extensionState";
import { setState } from "../state/actions";
import { msToS } from "../utils/msToS";

function parseConnections(included: (LItem | Record<string, any>)[]) {
  return included
    .filter((item): item is LItem => item.template === "UNIVERSAL")
    .map((item) => {
      const pp =
        item.insightsResolutionResults[0].simpleInsight.image?.attributes[0]
          ?.detailData?.nonEntityProfilePicture;

      return {
        firstName: item.title.text.split(" ")[0],
        lastName: item.title.text.split(" ")[1],
        headline: item.primarySubtitle.text, // job etc
        location: item.secondarySubtitle.text,
        publicIdentifier:
          item.navigationUrl.split("?")[0].split("/").pop() ?? "",
        // most profile lazy load, so image is broken
        profilePicture: pp ? pp?.artwork?.rootUrl : undefined,
        entityUrn:
          "urn:li:fsd_profile:" +
          item.entityUrn.match(/urn:li:fsd_profile:([A-Za-z0-9\-\_]+),/)?.[1],
        degree: item.badgeText.accessibilityText.match(
          /(\d+)(st|nd|rd|th) degree connection/,
        )?.[1],
        memorialized: false, //TODO
        connectedAt: msToS(Date.now()), //TODO
      };
    });
}

export async function fetch2ndDeg(urn_id: string) {
  const requestInitConfig = createFetchConfigs();

  let start = 0;

  const delayRange = {
    start: 1500,
    end: 3000,
  };

  // eslint-disable-next-line prefer-const
  let { limit, connections } = await fetchCon(urn_id, (start = 0));
  const neighbours = [...connections];

  while (start < limit) {
    const remaining = Date.now() - (state?.syncStart ?? 0);
    if (remaining < delayRange.start) {
      const wait = Math.floor(
        Math.random() * (delayRange.end - delayRange.start) +
          delayRange.start -
          remaining,
      );
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    start += connections.length;
    connections = (await fetchCon(urn_id, (start = start))).connections;
    // state.connections = state.connections
    await client.connection.upsertMany.mutate(connections);
    neighbours.push(...connections);
  }

  return neighbours;
}

export async function fetchCon(
  urn_id: string,
  start = 0,
  depth: Depth[] = ["F", "S"],
  reqConf: RequestInit = createFetchConfigs(),
) {
  const rliQueries = {
    start: start.toString(),
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
    msToS,
  };
  // const search
  const clusters = [
    "b0928897b71bd00a5a7291755dcd64f0",
    "806ff371aaae722f7d7ecee7a3e83900",
  ];
  // TODO randomly select clusters and spread it out

  const queryParams = {
    variables: jsToRestli(rliQueries),
    queryId: `voyagerSearchDashClusters.${clusters[0]}`,
  };
  const fetch_params = {
    referrer: "https://www.linkedin.com/mynetwork/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  } as const;

  const res = await fetch(
    `https://www.linkedin.com/voyager/api/graphql?${Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&")}`,
    {
      headers: defaultHeaders,
      ...reqConf,
      ...fetch_params,
    },
  );
  // console.log(res);
  const data = (await res.json()) as LiNResponse;
  const limit =
    data.data.data.searchDashClustersByAll.metadata.totalResultCount;
  const filtered = parseConnections(data.included);
  console.table(filtered);

  await client.connection.upsertMany.mutate(filtered);
  return {
    connections: filtered,
    limit,
  };
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
