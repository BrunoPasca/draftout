"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GOALS } from "@/lib/board-timeline";
import type { ClaimEvent } from "@/lib/board-timeline";
import type { PlayerId } from "@/content/types";

const PLAYER_TEXT_CLASS: Record<PlayerId, string> = {
  a: "text-player-a",
  b: "text-player-b",
};
const PLAYER_DOT_CLASS: Record<PlayerId, string> = {
  a: "bg-player-a",
  b: "bg-player-b",
};

type ClaimTickerProps = {
  history: ClaimEvent[];
  lastClaim: ClaimEvent | null;
};

function labelForSlug(slug: string): string {
  return GOALS.find((g) => g.slug === slug)?.label ?? slug;
}

export function ClaimTicker({ history, lastClaim }: ClaimTickerProps) {
  const reduced = useReducedMotion();
  const items = history.slice(-6);
  if (items.length === 0 && lastClaim) items.push(lastClaim);

  if (reduced) {
    const fallback = lastClaim;
    return (
      <div className="font-mono text-xs uppercase tracking-widest text-muted">
        {fallback ? (
          <span>
            <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${PLAYER_DOT_CLASS[fallback.player]}`} />
            <span className={PLAYER_TEXT_CLASS[fallback.player]}>
              {fallback.player === "a" ? "A" : "B"}
            </span>
            <span className="ml-2">· {labelForSlug(fallback.slug)}</span>
          </span>
        ) : (
          <span>Standing by…</span>
        )}
      </div>
    );
  }

  return (
    <div className="group relative w-full overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-3 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((c, i) => (
          <div
            key={`${c.tick}-${i}`}
            className="flex items-center gap-2 rounded-full border border-border bg-surface-raised/70 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${PLAYER_DOT_CLASS[c.player]}`} />
            <span className={PLAYER_TEXT_CLASS[c.player]}>
              {c.player === "a" ? "A" : "B"}
            </span>
            <span>· {labelForSlug(c.slug)}</span>
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}
