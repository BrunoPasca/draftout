"use client";

import { WinStamp } from "@/components/board/hud/WinStamp";
import type { PlayerId } from "@/content/types";

type BoardHudProps = {
  isClimax: boolean;
  winner: PlayerId | null;
};

export function BoardHud({ isClimax, winner }: BoardHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <WinStamp visible={isClimax} winner={winner} />
    </div>
  );
}
