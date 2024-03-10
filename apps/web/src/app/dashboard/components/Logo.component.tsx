import { Flex, Title } from "@tremor/react";
import Image from "next/image";

export default function Logo(){
    return <Flex justifyContent="start" className="gap-3 w-min">
        <Image height={32} width={32} src="/lyra-logo.svg" alt="lyra-logo" />
        <Title>Lyra</Title>
    </Flex>
}