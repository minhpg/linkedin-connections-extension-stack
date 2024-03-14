import { api } from "@/trpc/server";
import { Card, Title, Button, Flex, Text } from "@tremor/react";
import Link from "next/link";
import { LiTable } from "../components/LiTable";

interface PageProps {
  searchParams: {
    page?: number;
  };
}

export default async function Page({ searchParams }: PageProps) {
  let page = 1;
  if (searchParams.page) page = searchParams.page;

  const limit = 10;

  const start = (page - 1) * limit;

  const { data, count } = await api.connection.getWithParams.query({
    start,
    limit,
  });

  const latestSync = await api.syncRecord.getLatest.query();

  return (
    <>
      <Flex>
        <Title>Dashboard</Title>
        {latestSync && (
          <Text>
            Last sync on{" "}
            {new Date(latestSync.syncEnd * 1000).toLocaleDateString()}
          </Text>
        )}
      </Flex>
      <Card className="mt-6">
        <LiTable data={data} />
      </Card>
      <Flex className="w-full p-5" justifyContent="between">
        <div className="w-full">
          <Text>
            Page <b>{page}</b>
          </Text>
          <Text>
            <b>{(page - 1) * limit + data.length}</b> out of <b>{count}</b>{" "}
            records
          </Text>
        </div>
        <Flex className="gap-3" justifyContent="end">
          <Link
            href={{
              query: { ...searchParams, page: +page - 1 },
            }}
          >
            <Button variant="light" disabled={page <= 1}>
              Prev
            </Button>
          </Link>
          <Link
            href={{
              query: { ...searchParams, page: +page + 1 },
            }}
          >
            <Button variant="light" disabled={page >= count / limit}>
              Next
            </Button>
          </Link>
        </Flex>
      </Flex>
    </>
  );
}
