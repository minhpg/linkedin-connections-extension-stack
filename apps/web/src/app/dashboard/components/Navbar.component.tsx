"use client";

import { Button, Card, Flex, Text } from "@tremor/react";
import Link from "next/link";
import { useSessionContext } from "@/app/contexts/Session.context";
import Logo from "./Logo.component";
import { signOut } from "next-auth/react";
import { Popover } from "@headlessui/react";
import SearchDialog from "./SearchDialog.component";
import { RiMenu3Line } from "@remixicon/react";

const Navbar = () => {
  const navbarItems = [
    {
      path: "/dashboard",
      title: "Dashboard",
    },
    {
      path: "/dashboard/connections",
      title: "Connections",
    },
    {
      path: "/dashboard/sync-history",
      title: "Sync History",
    },
  ];

  return (
    <>
      <Flex className="my-6" justifyContent="between" alignItems="center">
        <Flex justifyContent="start">
          <Link href="/dashboard" className="w-full text-xl">
            <Logo />
          </Link>
          <Flex className="justify-end gap-3">
            <SearchDialog />
            <Popover className="relative">
              <Popover.Button className="outline-none flex" as={"div"}>
                <Button color="slate" variant="light" className={`self-center`} icon={RiMenu3Line}>

                </Button>
              </Popover.Button>

              <Popover.Panel className="absolute right-0 z-10">
                <Card className="p-2">
                  <UserProfileCard />
                  <div className="flex flex-col border-b border-t border-slate-200 px-4 py-5 ">
                    {navbarItems.map((item) => (
                      <Link href={item.path} key={item.path}>
                        <Button
                          color="slate"
                          variant="light"
                          className={`h-full p-2`}
                        >
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 p-3">
                    <Link href="/privacy">
                      <Text className="text-xs underline">
                        Privacy policies
                      </Text>
                    </Link>
                    <Link href="/terms-of-service">
                      <Text className="text-xs underline">
                        Terms of service
                      </Text>
                    </Link>
                  </div>
                </Card>
              </Popover.Panel>
            </Popover>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

const UserProfileCard = () => {
  const { session } = useSessionContext();

  if (!session?.user) return;

  const { name, email, image } = session.user;

  return (
    <Flex className="p-3">
      <Flex className="justify-between gap-10 text-right">
        <div className="size-12 rounded-full bg-slate-200">
          {image && <img className="w-full rounded-full" src={image} />}
        </div>
        <div className="flex flex-col items-end">
          <Text className="-mb-1 text-xl font-semibold text-black">{name}</Text>
          <div>
            <Button variant="light" className="font-normal">
              {email}
            </Button>
          </div>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={() => signOut()}
          >
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </Flex>
      <div></div>
    </Flex>
  );
};

export default Navbar;
