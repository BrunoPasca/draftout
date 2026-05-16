"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PlayerId } from "@/lib/board-demo";

type BoardCellProps = {
  label: string;
  owner: PlayerId | null;
  index: number;
  isLatest?: boolean;
};

const ownerStyles: Record<PlayerId, string> = {
  a: "bg-player-a/25 border-player-a text-foreground",
  b: "bg-player-b/25 border-player-b text-foreground",
};

export function BoardCell({ label, owner, index, isLatest }: BoardCellProps) {
  const reduced = useReducedMotion();
  const claimed = owner !== null;

  return (
    <motion.div
      layout
      className={[
        "relative flex aspect-square items-center justify-center rounded-lg border p-1.5 text-center text-[10px] font-medium leading-tight sm:text-xs",
        claimed ? ownerStyles[owner] : "border-border bg-surface-raised/80 text-muted",
        claimed ? "shadow-sm" : "",
      ].join(" ")}
      initial={false}
      animate={
        isLatest && !reduced
          ? { scale: [1, 1.08, 1], transition: { duration: 0.35 } }
          : { scale: 1 }
      }
      whileHover={claimed || reduced ? undefined : { scale: 1.04, borderColor: "var(--color-emerald)" }}
      transition={{ duration: 0.2 }}
    >
      {claimed && (
        <motion.span
          className="absolute top-1 right-1 h-2 w-2 rounded-full"
          style={{
            backgroundColor: owner === "a" ? "var(--color-player-a)" : "var(--color-player-b)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-hidden
        />
      )}
      <span className="line-clamp-3">{label}</span>
      {claimed && (
        <motion.span
          className="sr-only"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Claimed by player {owner === "a" ? "A" : "B"}
        </motion.span>
      )}
      <span className="absolute bottom-0.5 left-1 font-mono text-[8px] opacity-30">
        {index + 1}
      </span>
    </motion.div>
  );
}
