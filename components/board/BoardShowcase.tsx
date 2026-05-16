"use client";

import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useBoardTimeline } from "@/lib/board-timeline";
import { BoardHud } from "@/components/board/hud/BoardHud";

const BoardScene = dynamic(
  () => import("@/components/board/BoardScene").then((m) => m.BoardScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse border border-emerald/20 bg-surface-raised"
        aria-hidden
      />
    ),
  },
);

export function BoardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-80px", amount: 0.2 });
  const timeline = useBoardTimeline({ active: inView });

  const latestIndex = timeline.lastClaim?.index ?? null;

  return (
    <motion.div
      ref={sectionRef}
      className="relative w-full h-[360px] overflow-hidden sm:h-[520px] md:h-[600px] lg:h-[680px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <BoardScene
        active={inView}
        owners={timeline.owners}
        latestIndex={latestIndex}
        lastClaim={timeline.lastClaim}
        isClimax={timeline.isClimax}
        className="h-full w-full"
      />
      <BoardHud isClimax={timeline.isClimax} />
    </motion.div>
  );
}
