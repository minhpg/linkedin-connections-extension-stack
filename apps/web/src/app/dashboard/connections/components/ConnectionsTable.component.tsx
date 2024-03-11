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
import { ConnectionPageProps } from "../page";

export default async function ConnectionsTable({
  searchParams,
}: ConnectionPageProps) {
  let page = 1;
  if (searchParams.page) page = searchParams.page;

  const limit = 10;

  const start = (page - 1) * limit;

  const [data, count] = await api.connection.getWithParams.query({
    start,
    limit,
  });

  return (
    <>
      <Card className="mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Connected on</TableHeaderCell>
              <TableHeaderCell>Updated on</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.entityUrn}>
                <TableCell className="flex justify-start gap-3">
                  {item.profilePicture ? (
                    <img
                      src={item.profilePicture}
                      alt={item.firstName}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300">
                      {item.firstName[0]}
                    </div>
                  )}
                  <div>
                    <div>
                      <span className="font-semibold text-black">
                        {item.firstName} {item.lastName}
                      </span>{" "}
                    </div>
                    <div>
                      (
                      <Link
                        href={`https://linkedin.com/in/${item.publicIdentifier}`}
                        target="_blank"
                      >
                        <Button variant="light">
                          @{item.publicIdentifier}
                        </Button>
                      </Link>
                      )
                    </div>
                    <div className="max-w-96 overflow-hidden text-wrap">
                      {item.headline}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(item.connectedAt * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleDateString()}
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