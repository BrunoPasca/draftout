"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BoardCell } from "@/components/board/BoardCell";
import { BoardProgress } from "@/components/board/BoardProgress";
import {
  BOARD_GOALS,
  DEMO_CLAIMS,
  type PlayerId,
  WIN_TARGET,
} from "@/lib/board-demo";
import { useBoardClaim } from "@/lib/board-claim-context";

const INITIAL_OWNERS = Array.from<PlayerId | null>({ length: 25 }).fill(null);

export function BingoGrid() {
  const { notifyClaim } = useBoardClaim();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [owners, setOwners] = useState<(PlayerId | null)[]>(INITIAL_OWNERS);
  const [step, setStep] = useState(0);
  const [latestIndex, setLatestIndex] = useState<number | null>(null);

  const scores = owners.reduce(
    (acc, owner) => {
      if (owner === "a") acc.a += 1;
      if (owner === "b") acc.b += 1;
      return acc;
    },
    { a: 0, b: 0 },
  );

  const activePlayer: PlayerId =
    DEMO_CLAIMS[step % DEMO_CLAIMS.length]?.player ?? "a";

  const reset = useCallback(() => {
    setOwners([...INITIAL_OWNERS]);
    setStep(0);
    setLatestIndex(null);
  }, []);

  useEffect(() => {
    if (!inView || reduced) return;

    if (step >= DEMO_CLAIMS.length || scores.a >= WIN_TARGET || scores.b >= WIN_TARGET) {
      const timeout = setTimeout(reset, 2800);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      const claim = DEMO_CLAIMS[step];
      setOwners((prev) => {
        const next = [...prev];
        next[claim.index] = claim.player;
        return next;
      });
      setLatestIndex(claim.index);
      notifyClaim(claim.player, claim.index);
      setStep((s) => s + 1);
    }, 900);

    return () => clearTimeout(timeout);
  }, [inView, reduced, step, scores.a, scores.b, reset, notifyClaim]);

  useEffect(() => {
    if (reduced && inView && step === 0) {
      const snapshot = [...INITIAL_OWNERS];
      DEMO_CLAIMS.slice(0, 8).forEach((c) => {
        snapshot[c.index] = c.player;
      });
      setOwners(snapshot);
      setStep(8);
    }
  }, [reduced, inView, step]);

  return (
    <motion.div ref={ref} className="space-y-6">
      <BoardProgress scores={scores} activePlayer={activePlayer} />
      <div
        className="grid grid-cols-5 gap-1.5 sm:gap-2"
        role="grid"
        aria-label="Draftout bingo board demo"
      >
        {BOARD_GOALS.map((goal, index) => (
          <BoardCell
            key={goal.id}
            index={index}
            label={goal.label}
            owner={owners[index]}
            isLatest={latestIndex === index}
          />
        ))}
      </div>
      <p className="text-center text-sm text-muted">
        Completed goals lock for your opponent — race to {WIN_TARGET} before they do.
      </p>
    </motion.div>
  );
}