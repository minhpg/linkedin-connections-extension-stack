import {
  Card,
  Tab,
  TabGroup,
  TabList,
  TabPanels,
  Text,
  Title,
} from "@tremor/react";
import { Suspense } from "react";
import UserProfileCard from "./components/UserProfileCard.component";
import ConnectionsGrid from "./components/ConnectionsGrid.component";

export interface ConnectionsPageProps {
  searchParams: {
    page?: number;
  };
}

export default async function Page({ searchParams }: ConnectionsPageProps) {
  return (
    <>
      <Title>Dashboard</Title>
      <div className="mt-6">
        <Suspense
          fallback={
            <Card>
              <Text>Loading...</Text>
            </Card>
          }
        >
          <UserProfileCard />
        </Suspense>
      </div>
      <TabGroup className="mt-6">
        <TabList variant="line" defaultValue="1">
          <Tab value="1">Connections</Tab>
        </TabList>
        <TabPanels>
          <TabPanels>
            <Suspense
              key={searchParams.page}
              fallback={<Text className="mt-6">Loading...</Text>}
            >
              <ConnectionsGrid searchParams={searchParams} />
            </Suspense>
          </TabPanels>
        </TabPanels>
      </TabGroup>
    </>
  );
}
