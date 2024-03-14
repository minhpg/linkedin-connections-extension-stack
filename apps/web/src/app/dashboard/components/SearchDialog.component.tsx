"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button, Card, Flex, Text, TextInput } from "@tremor/react";
import { RiCloseLine, RiCrossLine, RiSearchLine } from "@remixicon/react";
import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";
import AvatarFallback from "./AvatarFallback.component";
import Link from "next/link";

export default function SearchDialog() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [finalQuery, setFinalQuery] = useState("");
  const [currentPath, setCurrentPath] = useState(pathname);
  /** Delay fetching after user input to reduce fetching */
  useEffect(() => {
    const timeout = setTimeout(() => setFinalQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (pathname != currentPath) setIsOpen(false);
  }, [pathname]);

  const { data } = api.connection.fullTextSearch.useQuery(
    finalQuery.split(" ").join("|"),
  );

  return (
    <>
      <Button
        color="slate"
        variant="light"
        className={`self-center`}
        icon={RiSearchLine}
        onClick={() => setIsOpen(true)}
      ></Button>
      <Dialog
        key={pathname}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
        <div className="fixed top-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="mx-auto w-full bg-transparent p-0 md:max-w-xl lg:max-w-3xl">
              <Flex className="gap-3 rounded-xl bg-white">
                <TextInput
                  className="border-none shadow-none outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search..."
                />
                <Button
                  color="slate"
                  variant="light"
                  size="lg"
                  className={`mr-3 self-center`}
                  icon={RiCloseLine}
                  onClick={() => setIsOpen(false)}
                ></Button>
              </Flex>
              {data && data.length > 0 && (
                <Card className="mt-6 py-3">
                  {data.length == 0 && <Text>No results found!</Text>}
                  {data.map((user) => (
                    <div className="py-3">
                      <Flex className="justify-start gap-5">
                        <div className="shrink-0 self-start">
                          <AvatarFallback
                            className="size-14 rounded-full"
                            src={user.profilePicture}
                            alt={user.firstName}
                            fallback={
                              <div className="relative inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                                <span className="font-medium text-gray-600 dark:text-gray-300">
                                  {user.firstName[0]}
                                </span>
                              </div>
                            }
                          />
                        </div>
                        <div className="w-full">
                          <Link
                            href={`/dashboard/users/@${user.publicIdentifier}`}
                            className="text-nowrap font-semibold text-black hover:underline"
                          >
                            {user.firstName} {user.lastName}
                          </Link>
                          <div className="-mt-1 w-5/6 overflow-hidden text-ellipsis">
                            <Link
                              href={`https://linkedin.com/in/${user.publicIdentifier}`}
                              target="_blank"
                            >
                              <Button variant="light">
                                @{user.publicIdentifier}
                              </Button>
                            </Link>
                          </div>
                          <Text>{user.headline}</Text>
                        </div>
                      </Flex>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
