import { Card, Text } from "@tremor/react";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col justify-center">
      <div className="flex w-full justify-center">
        <Text>Loading...</Text>
      </div>
    </div>
  );
}

export const LoadingCard = () => {
  return <Card className="mt-6 h-48 w-full"></Card>;
};
