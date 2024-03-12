import { api } from "@/trpc/server";
import { RiRecycleLine } from "@remixicon/react";
import {
  Button,
  Card,
  Flex,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title,
} from "@tremor/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SyncButton from "./components/SyncButton.component";
import ConnectionsGrid from "./components/ConnectionsGrid.component";
import { Suspense } from "react";

export interface UserPageProps {
  params: {
    identifier: string;
  };
  searchParams: {
    page?: number;
  };
}

export default async function UserPage({
  params,
  searchParams,
}: UserPageProps) {
  const identifier = decodeURIComponent(params.identifier);
  let publicIdentifier;
  let entityUrn;

  if (identifier.charAt(0) == "@") {
    publicIdentifier = identifier.replace("@", "");
  }

  if (identifier.includes("urn:fsd_profile")) {
    entityUrn = identifier;
  }

  console.log(publicIdentifier, entityUrn);

  const user = await api.connection.getUserProfile.query({
    publicIdentifier,
    entityUrn,
  });

  if (!user) return notFound();
  return (
    <>
      <Card className="w-full">
        <div className="flex justify-start gap-5">
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt={user.publicIdentifier}
              className="size-20 self-start rounded-full"
            />
          )}
          {!user.profilePicture && (
            <div className="relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-200">
              <span className="text-2xl font-bold text-gray-600">
                {user.firstName[0]}
              </span>
            </div>
          )}
          <div className="self-start">
            <Flex justifyContent="start" className="gap-2">
              <Title>
                {user.firstName} {user.lastName}
              </Title>{" "}
              <div>
                (
                <Link
                  href={`https://linkedin.com/in/${user.publicIdentifier}`}
                  target="_blank"
                >
                  <Button variant="light">@{user.publicIdentifier}</Button>
                </Link>
                )
              </div>
            </Flex>
            <Text className="wrap">{user.headline}</Text>
            <div className="ml-1 mt-3">
              <SyncButton />
            </div>
          </div>
        </div>
      </Card>
      <TabGroup className="mt-6">
        <TabList variant="line" defaultValue="1">
          <Tab value="1">Connections</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Suspense
              key={searchParams.page}
              fallback={<Text className="mt-6">Loading...</Text>}
            >
              <ConnectionsGrid
                userUrn={user.entityUrn}
                searchParams={searchParams}
              />
            </Suspense>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
}
