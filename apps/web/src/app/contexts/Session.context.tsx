"use client";

import type { Session } from "next-auth";
import { type ReactNode, useContext, createContext } from "react";

export interface ISessionContext {
  session: Session | null;
}

export const SessionContext = createContext<ISessionContext>({
  session: null,
});

export interface SessionContextProviderProps {
  children: ReactNode;
  session: Session | null;
}

export const SessionContextProvider = ({
  children,
  session,
}: SessionContextProviderProps) => {
  if (typeof window !== "undefined") {
    if (session) {
      localStorage.setItem("lyra-extension-token", JSON.stringify(session))
    }
    else {
      localStorage.removeItem("lyra-extension-token");
      localStorage.removeItem("lyra-extension-authorized")
    }
  }

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  return useContext(SessionContext);
};
