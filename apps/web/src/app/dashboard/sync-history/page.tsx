import { api } from "@/trpc/server";
import {
  Card,
  Title,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Button,
  Flex,
  Text,
  BadgeDelta,
  Textarea,
} from "@tremor/react";
import Link from "next/link";

interface SyncHistoryPageProps {
  searchParams: {
    page?: number;
  };
}

export default async function SyncHistoryPage({ searchParams }: SyncHistoryPageProps) {
  let page = 1;
  if (searchParams.page) page = searchParams.page;

  const limit = 10;

  const start = (page - 1) * limit;

  const [data, count] = await api.syncRecord.getWithParams.query({
    start,
    limit,
  });

  return (
    <>
      <Flex>
        <Title>Syncing History</Title>
      </Flex>
      <Card className="mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Connections added</TableHeaderCell>
              <TableHeaderCell>Logs</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {new Date(item.syncEnd * 1000).toLocaleTimeString()}{" "}
                  {new Date(item.syncEnd * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge color={item.syncSuccess ? "green" : "red"}>
                    {item.syncSuccess ? "Success" : "Error"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <BadgeDelta
                    deltaType={
                      item.endCount - item.startCount >= 0
                        ? item.endCount - item.startCount == 0
                          ? "unchanged"
                          : "moderateIncrease"
                        : "moderateDecrease"
                    }
                    isIncreasePositive={true}
                  >
                    {(item.endCount - item.startCount).toString()}
                  </BadgeDelta>
                </TableCell>
                <TableCell>
                  <code>
                    <Textarea
                      disabled
                      value={item.syncErrorMessage ?? "None"}
                      className="w-full resize-none"
                      rows={1}
                    ></Textarea>
                  </code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
