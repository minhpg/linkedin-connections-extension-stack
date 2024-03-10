"use client";

import { Button } from "@tremor/react";
import type { BuiltInProviderType } from "next-auth/providers/index";
import { type ClientSafeProvider, type LiteralUnion, signIn } from "next-auth/react";

export interface ProvidersListProps {
  providers:
    | Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
    | never[];
}

export default function ProvidersList({ providers }: ProvidersListProps) {
  return (
    <div className="mt-10 w-full">
      {Object.values(providers).map((provider) => (
        <Button
          key={provider.id}
          variant="primary"
          onClick={() =>
            signIn(provider.id, {
              callbackUrl: `/dashboard`,
            })
          }
          className="w-full"
        >
          Sign in with {provider.name}
        </Button>
      ))}
    </div>
  );
}
