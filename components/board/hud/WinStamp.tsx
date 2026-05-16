"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PlayerId } from "@/content/types";

type WinStampProps = {
  visible: boolean;
  winner: PlayerId | null;
};

const PLAYER_NAME: Record<PlayerId, string> = { a: "PLAYER A", b: "PLAYER B" };
const PLAYER_COLOR_CLASS: Record<PlayerId, string> = {
  a: "text-player-a",
  b: "text-player-b",
};

export function WinStamp({ visible, winner }: WinStampProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.4 }}
        >
          {winner && (
            <motion.span
              className={`font-mono text-sm font-bold uppercase tracking-[0.5em] ${PLAYER_COLOR_CLASS[winner]}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: reduced ? 0.2 : 0.3, delay: reduced ? 0 : 0.1 }}
            >
              {PLAYER_NAME[winner]} wins
            </motion.span>
          )}
          <motion.span
            className="rounded-md bg-emerald px-10 py-4 text-5xl font-extrabold tracking-[0.2em] text-surface shadow-[0_0_80px_rgba(61,214,140,0.7)] sm:text-7xl"
            initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)", scale: 1.05 }}
            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)", scale: 1 }}
            exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)", scale: 0.98 }}
            transition={{ duration: reduced ? 0.2 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            DRAFTOUT
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
