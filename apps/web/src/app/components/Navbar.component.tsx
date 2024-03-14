import { Flex } from "@tremor/react";
import Link from "next/link";
import Logo from "../dashboard/components/Logo.component";

const Navbar = () => {
  return (
    <>
      <Flex className="my-6" justifyContent="between" alignItems="center">
        <Flex justifyContent="start">
          <Link href="/" className="w-full text-xl">
            <Logo />
          </Link>
        </Flex>
      </Flex>
    </>
  );
};

export default Navbar;
