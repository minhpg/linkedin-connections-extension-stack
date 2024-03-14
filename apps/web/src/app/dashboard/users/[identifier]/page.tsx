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
import ConnectionsGrid from "./components/ConnectionsGrid.component";
import { Suspense } from "react";
import parseIdentifier from "@/utils/parseIdentifier";

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
  const { publicIdentifier, entityUrn } = parseIdentifier(params.identifier);

  const [user, connectionCount] = await Promise.all([
    api.connection.getUserProfile.query({
      publicIdentifier,
      entityUrn,
    }),
    api.connection.getUserConnectionCount.query({
      publicIdentifier,
      entityUrn,
    }),
  ]);

  if (!user) return <Title>Not found!</Title>;

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
            <Button variant="light" className="mt-3">
              {connectionCount} connections synced
            </Button>
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
                identifier={params.identifier}
                searchParams={searchParams}
              />
            </Suspense>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
}
