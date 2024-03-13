import { atom } from "jotai";
import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  devtools,
  StateStorage,
} from "zustand/middleware";

export type LItem = {
  template: "UNIVERSAL";
  title: { text: string }; //name
  primarySubtitle: { text: string }; //headline
  secondarySubtitle: { text: string }; //location
  navigationUrl: string; // make sure to strip the query
  trackingUrn: string; //"urn:li:member:271817611",
  entityUrn: string;
  // "urn:li:fsd_entityResultViewModel:(urn:li:fsd_profile:ACoAABAzm4sB0gyrUNF45a-nGZy5SheLjStCRSY,SEARCH_SRP,DEFAULT)",

  insightsResolutionResults: {
    simpleInsight: {
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
        }[];
      };
    };
  }[];
  badgeText: {
    // {1st|2nd|3rd} degree connection
    accessibilityText: string; // degree connection
  };
};

// const limit = 100;
// const count = 12;
// const start = 0;

export type Depth = "F" | "S" | "O";
export type LiNResponse = {
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
export interface SyncStore {
  start: Date;
  end: Date;
  urn_id: string | null;
  depth: Depth[];
}

// const persistentStorage: StateStorage = {
//   getItem: (key): string => {
//     return JSON.parse(localStorage.getItem(key)!);
//   },
//   setItem: (key, newValue): void => {
//     localStorage.setItem(key, JSON.stringify(newValue));
//   },
//   removeItem: (key): void => {
//     localStorage.removeItem(key);
//   },
// };
// const storageOptions = {
//   name: "syncStore",
//   storage: createJSONStorage<SyncStore>(() => persistentStorage),
// };
// export const useSync = create<SyncStore>()(
//   persist(
//     (set) => ({
//       start: new Date(),
//       end: new Date(),
//       urn_id: null,
//       depth: ["F"],
//     }),
//     storageOptions,
//   ),
// );
// // useSync.getState()
