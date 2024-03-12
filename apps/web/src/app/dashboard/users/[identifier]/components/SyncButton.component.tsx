"use client";
import { RiRecycleLine, RiRefreshLine } from "@remixicon/react";
import { Button } from "@tremor/react";

export default function SyncButton() {
  return (
    <Button variant="light" icon={RiRefreshLine}>
      Sync connections
    </Button>
  );
}
