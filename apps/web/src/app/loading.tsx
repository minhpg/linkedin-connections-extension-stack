import { Card, Text } from "@tremor/react";

export default function Loading() {
  return <Text>Loading...</Text>;
}

export const LoadingCard = () => {
  return <Card className="w-full h-48 mt-6"></Card>;
};
