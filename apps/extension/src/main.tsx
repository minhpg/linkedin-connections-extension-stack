import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Button, Callout, Flex, Text, Title } from "@tremor/react";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";

import { useExtensionState } from "./hooks/useExtensionState.hook";
import {
  fetchConnectionsList,
  fetchCookies,
  fetchLatestSyncState,
  setState,
} from "./state/actions";

import "./index.css";
import { LinkedInIncludedMergedResponse } from "./background/background";
import { User } from "./state/extensionState";
import { getBaseUrl } from "./trpc/trpcClient";

const root = document.getElementById("root");
if (root === null) throw new Error("Root container missing in index.html");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

function App() {
  const {
    initialized,
    extensionState: { cookies, syncEnd, token, user, synced },
  } = useExtensionState();

  useEffect(() => {
    if (token) {
      fetchCookies();
      fetchLatestSyncState();
    }
  }, [token]);

  if (!initialized) {
    return <Text>Loading...</Text>;
  }

  if (!token) {
    return (
      <Flex className="h-full flex-col justify-center p-5">
        <div>
          <Title className="w-full text-center">
            Please authorize login via Lyra webapp!
          </Title>
          <Button
            variant="primary"
            className="w-full"
            onClick={async () => {
              console.log(getBaseUrl());
              await chrome.tabs.create({
                url: `${getBaseUrl()}/api/auth/signin`,
              });
            }}
          >
            Login
          </Button>
        </div>
      </Flex>
    );
  }

  return (
    <div className="p-5">
      <UserProfileCard user={user} />
      <Title className="mt-6">Sync LinkedIn Connections</Title>
      <Text>
        Last synced:{" "}
        {syncEnd ? new Date(syncEnd).toLocaleTimeString() : "Never"}
      </Text>

      <div className="mt-6">
        <div className="flex gap-1 text-black">
          <Text className="text-black">
            1. Logged in to{" "}
            <span className="font-semibold underline">LinkedIn</span>.
          </Text>
          {cookies && (
            <Button variant="light" icon={RiCheckLine} color="green"></Button>
          )}
          {!cookies && (
            <Flex className="flex-1">
              <Button variant="light" icon={RiCloseLine} color="red"></Button>
              <Button variant="light" onClick={fetchCookies}>
                Retry
              </Button>
            </Flex>
          )}
        </div>
        <div className="flex gap-1">
          <Text className="text-black">
            2. Synced to{" "}
            <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-semibold text-transparent">
              Lyra
            </span>
          </Text>{" "}
          <Flex className="flex-1">
            {synced && (
              <Button variant="light" icon={RiCheckLine} color="green"></Button>
            )}
            {!synced && (
              <Button variant="light" icon={RiCloseLine} color="red"></Button>
            )}
            <Button variant="light" onClick={fetchConnectionsList}>
              Sync now
            </Button>
          </Flex>
        </div>
      </div>

      {cookies && <SyncStatusCallout />}
    </div>
  );
}

const SyncStatusCallout = () => {
  const {
    extensionState: { syncStart, syncEnd, syncError, startCount, connections },
  } = useExtensionState();

  let parsedConnections: LinkedInIncludedMergedResponse[] = [];

  if (connections) parsedConnections = Object.values(connections);

  if (syncError) {
    return (
      <Callout title="Sync error:" color="red" className="mt-6">
        {syncError}
      </Callout>
    );
  }

  if (!syncError) {
    if (!syncStart && !syncEnd) {
      return (
        <Callout title="Sync status:" color={"blue"} className="mt-6">
          Sync not started!
        </Callout>
      );
    }
    if (syncStart && !syncEnd) {
      return (
        <Callout title="Sync status:" color={"blue"} className="mt-6">
          <div>
            Syncing starts at {new Date(syncStart).toLocaleTimeString()}
            <br />
            Syncing {parsedConnections.length} connections
          </div>
        </Callout>
      );
    }
    if (syncEnd && !syncStart) {
      return (
        <Callout title="Sync status:" color={"blue"} className="mt-6">
          Last sync ended at {new Date(syncEnd).toLocaleTimeString()}
          <br />
          Synced {startCount} connections
        </Callout>
      );
    }
    if (syncEnd && syncStart) {
      return (
        <Callout title="Sync status:" color={"green"} className="mt-6">
          Syncing ended at {new Date(syncEnd).toLocaleTimeString()} - took{" "}
          {((syncEnd - syncStart) / 1000).toFixed(0)} seconds
          <br />
          Updated {parsedConnections.length} connections
        </Callout>
      );
    }
  }
  return <></>;
};
const UserProfileCard = ({ user }: { user: Readonly<User> | null }) => {
  if (!user) return <></>;
  const { name, email } = user;

  const handleLogout = () => {
    setState({
      cookies: null,
      connections: null,
      syncStart: null,
      syncEnd: null,
      loading: false,
      loggedIn: false,
      user: null,
      token: null,
      synced: false,
      syncError: null,
      startCount: 0,
    });
  };

  return (
    <Flex className="py-3">
      <Flex className="justify-start gap-5">
        <img className="h-8 w-8 rounded-full" src={user.image} />
        <div>
          <Text className="font-semibold text-black">{name}</Text>
          <div>
            <Button variant="light" className="font-normal">
              {email}
            </Button>
          </div>
        </div>
      </Flex>
      <div>
        <Button size="xs" variant="primary" color="red" onClick={handleLogout}>
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </Flex>
  );
};
