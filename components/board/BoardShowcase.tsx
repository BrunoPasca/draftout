"use client";

import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useBoardTimeline } from "@/lib/board-timeline";
import { BoardHud } from "@/components/board/hud/BoardHud";
import { BorderBeam } from "@/components/ui/BorderBeam";
import type { ClaimEvent } from "@/lib/board-timeline";

const BoardScene = dynamic(
  () => import("@/components/board/BoardScene").then((m) => m.BoardScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse rounded-2xl border border-emerald/20 bg-surface-raised"
        aria-hidden
      />
    ),
  },
);

const HISTORY_LIMIT = 6;

export function BoardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-80px", amount: 0.2 });
  const timeline = useBoardTimeline({ active: inView });
  const [history, setHistory] = useState<ClaimEvent[]>([]);

  useEffect(() => {
    if (!timeline.lastClaim) return;
    setHistory((prev) => [...prev, timeline.lastClaim!].slice(-HISTORY_LIMIT));
  }, [timeline.lastClaim]);

  const prevStep = useRef(timeline.step);
  useEffect(() => {
    if (prevStep.current > 0 && timeline.step === 0) {
      setHistory([]);
    }
    prevStep.current = timeline.step;
  }, [timeline.step]);

  const latestIndex = timeline.lastClaim?.index ?? null;

  return (
    <motion.div
      ref={sectionRef}
      className="relative mx-auto h-[300px] w-full max-w-3xl overflow-hidden rounded-2xl sm:h-[420px] md:h-[480px] lg:h-[520px]"
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
      <BoardHud
        scores={timeline.scores}
        activePlayer={timeline.activePlayer}
        history={history}
        lastClaim={timeline.lastClaim}
        isClimax={timeline.isClimax}
      />
      <BorderBeam
        size={280}
        duration={14}
        borderWidth={1.5}
        colorFrom="var(--color-emerald)"
        colorTo="var(--color-amber)"
      />
    </motion.div>
  );
}
