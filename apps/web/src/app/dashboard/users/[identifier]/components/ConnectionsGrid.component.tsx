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
  Col,
  Grid,
  Title,
} from "@tremor/react";
import Link from "next/link";
import { UserPageProps } from "../page";
import AvatarFallback from "@/app/dashboard/components/AvatarFallback.component";

interface ConnectionsGridProps {
  searchParams: UserPageProps["searchParams"];
  userUrn: string;
}

export default async function ConnectionsGrid({
  searchParams,
  userUrn,
}: ConnectionsGridProps) {
  let page = 1;
  if (searchParams.page) page = searchParams.page;

  const limit = 10;

  const start = (page - 1) * limit;

  const { data, count } =
    await api.connection.getConnectionsPaginationWithUrn.query({
      start,
      limit,
      entityUrn: userUrn,
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
      <Grid numItems={1} numItemsMd={2} numItemsLg={3} className="mt-6 gap-3">
        {data.map(({ to }) => (
          <Col key={`_${to.entityUrn}`} numColSpan={1}>
            <Card className="h-full">
              <Flex className="justify-start gap-3">
                <div className="shrink-0">
                  <AvatarFallback
                    className="size-14 rounded-full"
                    src={to.profilePicture}
                    alt={to.firstName}
                    fallback={
                      <div className="relative inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {to.firstName[0]}
                        </span>
                      </div>
                    }
                  />
                </div>
                <div className="w-full">
                  <Link
                    href={`/dashboard/users/@${to.publicIdentifier}`}
                    className="text-nowrap font-semibold text-black hover:underline"
                  >
                    {to.firstName} {to.lastName}
                  </Link>
                  <div className="-mt-1 w-5/6 overflow-hidden text-ellipsis">
                    <Link
                      href={`https://linkedin.com/in/${to.publicIdentifier}`}
                      target="_blank"
                    >
                      <Button variant="light">@{to.publicIdentifier}</Button>
                    </Link>
                  </div>
                </div>
              </Flex>
              <Text className="mt-3">{to.headline}</Text>
            </Card>
          </Col>
        ))}
      </Grid>

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
