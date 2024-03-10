import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Button, Card, Flex, Text, Title } from "@tremor/react";
import { RiCloseLine } from "@remixicon/react";

import { useExtensionState } from "./hooks/useExtensionState.hook";
import { setState } from "./state/actions";

import "./index.css";
import { User } from "./state/extensionState";

const root = document.createElement("div");
root.id = "crx-content-root";
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ContentApp />
  </React.StrictMode>,
);

function ContentApp() {
  const {
    extensionState: { token: stateToken },
    initialized,
  } = useExtensionState();

  const [isOpen, setIsOpen] = useState(false);

  const storageToken = localStorage.getItem("lyra-extension-token");
  const authorized = localStorage.getItem("lyra-extension-authorized");

  useEffect(() => {
    if (stateToken) setIsOpen(false);
    else setIsOpen(true);
  }, [stateToken]);

  useEffect(() => {
    if (storageToken && !authorized) setIsOpen(true);
  }, [storageToken, authorized]);

  useEffect(() => {
    if (!storageToken && !authorized)
      setState({
        token: null,
        user: null,
      });
  }, []);

  const updateToken = () => {
    if (!storageToken) return;

    const { token, user } = JSON.parse(storageToken) as {
      token: string;
      user: User;
    };

    setState({
      token,
      user,
    });

    localStorage.setItem("lyra-extension-authorized", "1");
    setIsOpen(false);
  };

  if (!initialized) return <></>;
  if (!isOpen) return <></>;

  return (
    <>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed bottom-0 flex w-screen items-center justify-center md:inset-0 md:p-4">
        <div className="mx-auto w-full md:w-3/4 lg:w-1/2">
          <Card className="flex h-64 w-full flex-col justify-between rounded-none md:rounded-xl">
            <div>
              <Flex>
                <Title>Authorize extension?</Title>
                <Button
                  color="slate"
                  icon={RiCloseLine}
                  variant="light"
                  onClick={() => setIsOpen(false)}
                ></Button>
              </Flex>
              <Text className="mt-6">Hello please authorize</Text>
            </div>
            <Flex>
              <Button onClick={updateToken}>Yes</Button>
              <Button color="red" onClick={() => setIsOpen(false)}>
                No
              </Button>
            </Flex>
          </Card>
        </div>
      </div>
    </>
  );
}
