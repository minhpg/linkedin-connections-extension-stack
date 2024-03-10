"use client";

import { Button, Card, Flex, Text } from "@tremor/react";
import Link from "next/link";
import { useSessionContext } from "@/app/contexts/Session.context";
import Logo from "./Logo.component";
import { signOut } from "next-auth/react";
import { Popover } from "@headlessui/react";

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
          <div className="w-full text-xl">
            <Logo />
          </div>
          <Popover className="relative">
            <Popover.Button className="outline-none" as={'div'}>
              <Button color="slate" variant="light" className={`self-center`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Button>
            </Popover.Button>

            <Popover.Panel className="absolute right-0 z-10 mt-2 w-72">
              <Card className="py-2 w-72">
                <UserProfileCard />
                <div className="flex flex-col mt-5">
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
              </Card>
            </Popover.Panel>
          </Popover>
        </Flex>
      </Flex>
    </>
  );
};


const UserProfileCard = () => {
  const {session} = useSessionContext()
  if(!session?.user) return;
  const { name, email, image } = session.user;
  return (
    <Flex className="py-3 border-b border-slate-200">
      <Flex className="justify-between text-right gap-5">
        { image ? <img className="rounded-full w-12 h-12" src={image} /> : <div className="rounded-full w-8 h-8 bg-slate-200"></div>}
        <div>
          <Text className="text-black font-semibold text-xl">{name}</Text>
          <div>
            <Button variant="light" className="font-normal">
              {email}
            </Button>
          </div>
          <Button size="xs" variant="light" color="red" onClick={() => signOut()}>
          <span className="text-sm">Logout</span>
        </Button>
        </div>
      </Flex>
      <div>
      </div>
    </Flex>
  );
};

export default Navbar;