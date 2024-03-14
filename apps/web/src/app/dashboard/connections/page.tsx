import { api } from "@/trpc/server";
import { Card, Title, Button, Flex, Text } from "@tremor/react";

import Link from "next/link";
import ConnectionsTable from "./components/ConnectionsTable.component";

export interface ConnectionPageProps {
  searchParams: {
    page?: number;
  };
}

export default async function Page({ searchParams }: ConnectionPageProps) {
  const latestSync = await api.syncRecord.getLatest.query();

  return (
    <>
      <Flex>
        <Title>Your connections</Title>
        {latestSync && (
          <Text>
            Last sync on{" "}
            {new Date(latestSync.syncEnd * 1000).toLocaleDateString()}
          </Text>
        )}
      </Flex>
      <ConnectionsTable searchParams={searchParams} />
    </>
  );
}
