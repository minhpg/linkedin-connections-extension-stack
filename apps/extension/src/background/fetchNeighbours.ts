import { RiUserLine } from "@remixicon/react";
import { createFetchConfigs, defaultHeaders } from "./fetchDefaults";

type Depth = "F" | "S" | "O";
const limit = 100;
const count = 12;
const start = 0;
type LItem = {
  template: "UNIVERSAL";
  title: { text: string }; //name
  primarySubtitle: { text: string }; //headline
  secondarySubtitle: { text: string }; //location
  navigationUrl: string; // make sure to strip the query
  trackingUrn: string; //"urn:li:member:271817611",
  entityUrn: string;
  // "urn:li:fsd_entityResultViewModel:(urn:li:fsd_profile:ACoAABAzm4sB0gyrUNF45a-nGZy5SheLjStCRSY,SEARCH_SRP,DEFAULT)",

  image: {
    attributes: {
      detailData: {
        nonEntityProfilePicture: {
          artwork: {
            rootUrl: string;
            artifacts: [
              {
                width: number;
                fileIdentifyingUrlPathSegment: string;
                expiresAt: number;
                height: number;
              },
            ];
          };
        } | null;
      };
    };
  };
};

type LiNResponse = {
  data: {
    data: {
      searchDashClustersByAll: {
        metadata: {
          totalResultCount: number;
        };
      };
    };
  };
  included: (LItem | Record<string, any>)[];
};
// filte by this

// }

export async function getConnections(_urn_id: string, depth: Depth[] = ["F"]) {
  const test_ids = [
    "ACoAADtMuHABG1As3mx2OIsLW4sdLpbcf66Oy0s",
    "ACoAADjS5VIBjMWQ8sCJvfAs8jftm4JbFw7LHic",
    "ACoAADXVN0oBLR_K1CCAKAzwpHkg1Expml3atXA",
    "ACoAAC8pCWkBlixvfG434-j9XHpMkz9zP3IZmtA",
    "ACoAACvd5uEBr_VqSjj9vTSQ4KC_gosqC4SFfQE",
    "ACoAAB3UX3QBUxAj29smnQhYeyvZlxCGyWHrnb4",
    "ACoAABveS-EBYF6A7flrnn_KWGV1AH7_XrTaIME",
    "ACoAADNhc3MBadbl-qjY2orFCfebC8XqKibxtcI",
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
  const clusters = [
    "b0928897b71bd00a5a7291755dcd64f0",
    "806ff371aaae722f7d7ecee7a3e83900",
  ];

  const queryParams = {
    // includeWebMetadata: "true",
    variables: jsToRestli(rliQueries),
    //this searchDashCluster seems to work for people in my network
    // need to test it more
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
  const data = (await a.json()) as LiNResponse;
  const limit =
    data.data.data.searchDashClustersByAll.metadata.totalResultCount;

  // urn:li:fsd_entityResultViewModel:(urn:li:fsd_profile:ACoAACfnMgUBdPOVa4vngNHmnbYKDwCs7qHqDsw,SEARCH_SRP,DEFAULT)
  // get urn:li:fsd_profile:ACoAACfnMgUBdPOVa4vngNHmnbYKDwCs7qHqDsw
  const regex = /urn:li:fsd_profile:([A-Za-z0-9]+),/;
  const filtered = data.included
    .filter((item): item is LItem => item.template === "UNIVERSAL")
    .map((item) => {
      console.log(item);

      const pp = item.image.attributes.detailData;
      // .artifacts[0].fileIdentifyingUrlPathSegment,
      return {
        name: item.title.text,
        headline: item.primarySubtitle.text,
        location: item.secondarySubtitle.text,
        profile: item.navigationUrl.split("?")[0],
        image: pp ? pp.nonEntityProfilePicture?.artwork.rootUrl : undefined,
        // search for urn:li:p
        entityUrn: item.entityUrn.match(regex)?.[1],
      };
    });
  console.log(filtered);

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
