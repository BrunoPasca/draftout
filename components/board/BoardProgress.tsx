"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PlayerId } from "@/lib/board-demo";
import { WIN_TARGET } from "@/lib/board-demo";

type BoardProgressProps = {
  scores: Record<PlayerId, number>;
  activePlayer: PlayerId;
};

export function BoardProgress({ scores, activePlayer }: BoardProgressProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex gap-6">
        {(["a", "b"] as const).map((player) => (
          <PlayerScore
            key={player}
            player={player}
            score={scores[player]}
            isActive={activePlayer === player}
          />
        ))}
      </div>
      <motion.div
        className="rounded-xl border border-border bg-surface-raised px-4 py-2 font-mono text-sm"
        key={scores.a + scores.b}
        initial={reduced ? false : { scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <span className="text-muted">First to </span>
        <span className="font-bold text-emerald">{WIN_TARGET}</span>
        <span className="text-muted"> wins</span>
      </motion.div>
    </motion.div>
  );
}

function PlayerScore({
  player,
  score,
  isActive,
}: {
  player: PlayerId;
  score: number;
  isActive: boolean;
}) {
  const label = player === "a" ? "Player A" : "Player B";
  const color = player === "a" ? "text-player-a" : "text-player-b";
  const barColor = player === "a" ? "bg-player-a" : "bg-player-b";
  const pct = Math.min((score / WIN_TARGET) * 100, 100);

  return (
    <motion.div
      className="min-w-[140px]"
      animate={isActive ? { opacity: 1 } : { opacity: 0.75 }}
    >
      <motion.div className="flex items-baseline justify-between gap-2">
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
        <motion.span
          className="font-mono text-lg font-bold tabular-nums"
          key={score}
          initial={{ scale: 1.2, color: "var(--color-emerald)" }}
          animate={{ scale: 1, color: "var(--color-foreground)" }}
          transition={{ duration: 0.3 }}
        >
          {score}
          <span className="text-sm font-normal text-muted"> / {WIN_TARGET}</span>
        </motion.span>
      </motion.div>
      <motion.div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}
