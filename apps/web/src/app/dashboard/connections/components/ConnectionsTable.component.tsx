import { api } from "@/trpc/server";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Button,
  Flex,
  Text,
} from "@tremor/react";
import Link from "next/link";
import { ConnectionsPageProps } from "../page";
import AvatarFallback from "../../components/AvatarFallback.component";

export default async function ConnectionsTable({
  searchParams,
}: ConnectionsPageProps) {
  let page = 1;

  if (searchParams?.page) page = searchParams?.page;

  const limit = 10;

  const start = (page - 1) * limit;

  const { data, count } = await api.connection.getConnectionsPagination.query({
    start,
    limit,
  });

  if (!data) {
    return (
      <Card className="mt-6">
        <Text>No entries found!</Text>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell></TableHeaderCell>
              <TableHeaderCell>Connected on</TableHeaderCell>
              <TableHeaderCell>Updated on</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ from, to, updatedAt, connectedAt }) => (
              <TableRow key={`${from.entityUrn}_${to.entityUrn}`}>
                <TableCell>
                  <Flex className="justify-start gap-5 flex-col md:!flex-row">
                    <div className="shrink-0 self-start">
                      <AvatarFallback
                        src={to.profilePicture}
                        alt={to.publicIdentifier}
                        className="size-16 md:size-14 rounded-full"
                        fallback={
                          <div className="relative inline-flex size-16 md:size-14 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {to.firstName[0]}
                            </span>
                          </div>
                        }
                      />
                    </div>
                    <div className="self-start">
                      <Link
                        href={`/dashboard/users/@${to.publicIdentifier}`}
                        className="font-semibold text-black hover:underline"
                      >
                        {to.firstName} {to.lastName}
                      </Link>
                      <div>
                        (
                        <Link
                          href={`https://linkedin.com/in/${to.publicIdentifier}`}
                          target="_blank"
                        >
                          <Button variant="light">
                            @{to.publicIdentifier}
                          </Button>
                        </Link>
                        )
                      </div>
                      <div className="max-w-96 overflow-hidden text-wrap">
                        {to.headline}
                      </div>
                    </div>
                  </Flex>
                </TableCell>
                <TableCell>
                  {connectedAt
                    ? new Date(connectedAt * 1000).toLocaleDateString()
                    : "Not available"}
                </TableCell>
                <TableCell>
                  {new Date(updatedAt).toLocaleDateString()}
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
