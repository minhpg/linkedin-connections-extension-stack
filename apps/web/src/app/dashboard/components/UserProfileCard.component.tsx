import { api } from "@/trpc/server";
import { Button, Card, Flex, Text, Title } from "@tremor/react";
import Link from "next/link";

export default async function UserProfileCard() {
  const user = await api.connection.getSelfProfile.query();
  const connectionCount = await api.connection.getSelfConnectionCount.query();

  if (!user)
    return (
      <Card className="w-full">
        <Title>Please sync using our extension!</Title>
      </Card>
    );

  return (
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
  );
}
