"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { PlayerId } from "@/content/types";

type ClaimEvent = { player: PlayerId; index: number; tick: number };

type BoardClaimContextValue = {
  lastClaim: ClaimEvent | null;
  notifyClaim: (player: PlayerId, index: number) => void;
};

const BoardClaimContext = createContext<BoardClaimContextValue | null>(null);

export function BoardClaimProvider({ children }: { children: ReactNode }) {
  const [lastClaim, setLastClaim] = useState<ClaimEvent | null>(null);

  const notifyClaim = useCallback((player: PlayerId, index: number) => {
    setLastClaim({ player, index, tick: Date.now() });
  }, []);

  return (
    <BoardClaimContext.Provider value={{ lastClaim, notifyClaim }}>
      {children}
    </BoardClaimContext.Provider>
  );
}

export function useBoardClaim() {
  const ctx = useContext(BoardClaimContext);
  if (!ctx) {
    throw new Error("useBoardClaim must be used within BoardClaimProvider");
  }
  return ctx;
}
