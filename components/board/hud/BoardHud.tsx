"use client";

import { WinStamp } from "@/components/board/hud/WinStamp";

type BoardHudProps = {
  isClimax: boolean;
};

export function BoardHud({ isClimax }: BoardHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <WinStamp visible={isClimax} />
    </div>
  );
}
