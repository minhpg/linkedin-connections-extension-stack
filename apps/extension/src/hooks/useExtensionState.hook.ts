import { useEffect, useState } from "react";
import { state } from "../state/extensionState";
import { useSnapshot } from "valtio";

export const useExtensionState = () => {
  const extensionState = useSnapshot(state);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "get-state" }, (response) => {
      Object.assign(state, response);
      setInitialized(true);
    });

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) =>
      Object.assign(
        state,
        Object.entries(changes).reduce((acc, [key, { newValue }]) => {
          // @ts-expect-error
          acc[key] = newValue;
          return acc;
        }, {})
      );

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return {
    extensionState,
    initialized,
  };
};
