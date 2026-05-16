"use client";

import sharedJson from "@/content/shared.json";
import type { SharedContent, PlayerId } from "@/content/types";
import { ClaimTicker } from "@/components/board/hud/ClaimTicker";
import { LockoutStamp } from "@/components/board/hud/LockoutStamp";
import { ScoreFlip } from "@/components/board/hud/ScoreFlip";
import type { ClaimEvent } from "@/lib/board-timeline";

const SHARED: SharedContent = sharedJson as SharedContent;

type BoardHudProps = {
  scores: Record<PlayerId, number>;
  activePlayer: PlayerId;
  history: ClaimEvent[];
  lastClaim: ClaimEvent | null;
  isClimax: boolean;
  winner: PlayerId | null;
};

export function BoardHud({ scores, activePlayer, history, lastClaim, isClimax, winner }: BoardHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <ScoreFlip player="a" value={scores.a} target={SHARED.winTarget} isActive={activePlayer === "a"} />
          <ScoreFlip player="b" value={scores.b} target={SHARED.winTarget} isActive={activePlayer === "b"} />
        </div>
        <div className="rounded-xl border border-border bg-surface-raised/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted backdrop-blur">
          First to <span className="font-bold text-emerald">{SHARED.winTarget}</span>
        </div>
      </div>

      <div className="hidden lg:block">
        <ClaimTicker history={history} lastClaim={lastClaim} />
      </div>

      <LockoutStamp visible={isClimax} winner={winner} />
    </div>
  );
}
