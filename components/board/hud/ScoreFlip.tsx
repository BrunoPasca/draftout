"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PlayerId } from "@/content/types";

type ScoreFlipProps = {
  player: PlayerId;
  value: number;
  target: number;
  isActive: boolean;
};

const PLAYER_LABEL: Record<PlayerId, string> = { a: "Player A", b: "Player B" };
const PLAYER_TEXT_CLASS: Record<PlayerId, string> = {
  a: "text-player-a",
  b: "text-player-b",
};

export function ScoreFlip({ player, value, target, isActive }: ScoreFlipProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`flex items-baseline gap-2 ${isActive ? "opacity-100" : "opacity-70"}`}>
      <span className={`text-xs font-semibold uppercase tracking-widest ${PLAYER_TEXT_CLASS[player]}`}>
        {PLAYER_LABEL[player]}
      </span>
      <div className="relative h-8 w-6 overflow-hidden font-mono text-2xl font-bold tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="absolute inset-0 flex items-center justify-center"
            initial={reduced ? { opacity: 0 } : { y: -32, opacity: 0, rotateX: -90 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, rotateX: 0 }}
            exit={reduced ? { opacity: 0 } : { y: 32, opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-mono text-sm text-muted">/ {target}</span>
    </div>
  );
}
