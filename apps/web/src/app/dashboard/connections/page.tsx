import { api } from "@/trpc/server";
import { Title, Flex, Text, Card } from "@tremor/react";
import ConnectionsTable from "./components/ConnectionsTable.component";
import { Suspense } from "react";

export interface ConnectionsPageProps {
  searchParams: {
    page?: number;
  };
}

export default async function ConnectionsPage({
  searchParams,
}: ConnectionsPageProps) {
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
      <Suspense
        key={searchParams.page}
        fallback={
          <Card className="mt-6">
            <Text>Loading...</Text>
          </Card>
        }
      >
        <ConnectionsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
