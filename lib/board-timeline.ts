"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import goalsJson from "@/content/board/goals.json";
import demoScriptJson from "@/content/board/demo-script.json";
import sharedJson from "@/content/shared.json";
import type { DemoClaim, Goal, PlayerId, SharedContent } from "@/content/types";

const GOALS: Goal[] = goalsJson as Goal[];
const SCRIPT: DemoClaim[] = demoScriptJson as DemoClaim[];
const SHARED: SharedContent = sharedJson as SharedContent;

const CLAIM_INTERVAL_MS = 900;
const RESET_DELAY_MS = 2800;

export type ClaimEvent = {
  index: number;
  slug: string;
  player: PlayerId;
  tick: number;
};

export type TimelineState = {
  step: number;
  owners: (PlayerId | null)[];
  scores: Record<PlayerId, number>;
  lastClaim: ClaimEvent | null;
  activePlayer: PlayerId;
  isClimax: boolean;
  reduced: boolean;
};

const INITIAL_OWNERS: (PlayerId | null)[] = Array.from({ length: GOALS.length }, () => null);

function indexOfSlug(slug: string): number {
  const i = GOALS.findIndex((g) => g.slug === slug);
  if (i < 0) throw new Error(`demo-script references unknown slug: ${slug}`);
  return i;
}

const SCRIPT_INDICES = SCRIPT.map((c) => ({
  index: indexOfSlug(c.cell),
  slug: c.cell,
  player: c.player,
}));

type UseBoardTimelineOpts = {
  active: boolean;
};

export function useBoardTimeline({ active }: UseBoardTimelineOpts): TimelineState {
  const reduced = useReducedMotion() ?? false;
  const [owners, setOwners] = useState<(PlayerId | null)[]>(INITIAL_OWNERS);
  const [step, setStep] = useState(0);
  const [lastClaim, setLastClaim] = useState<ClaimEvent | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scores = useMemo(() => {
    return owners.reduce(
      (acc, owner) => {
        if (owner === "a") acc.a += 1;
        if (owner === "b") acc.b += 1;
        return acc;
      },
      { a: 0, b: 0 } as Record<PlayerId, number>,
    );
  }, [owners]);

  const reset = useCallback(() => {
    setOwners([...INITIAL_OWNERS]);
    setStep(0);
    setLastClaim(null);
  }, []);

  useEffect(() => {
    if (!active) {
      if (tickTimer.current) clearTimeout(tickTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      return;
    }

    if (reduced) {
      // Reduced motion: jump straight to a representative mid-game snapshot.
      if (step === 0) {
        const snap = [...INITIAL_OWNERS];
        SCRIPT_INDICES.slice(0, 8).forEach((c) => {
          snap[c.index] = c.player;
        });
        setOwners(snap);
        setStep(8);
      }
      return;
    }

    if (step >= SCRIPT_INDICES.length) {
      resetTimer.current = setTimeout(reset, RESET_DELAY_MS);
      return () => {
        if (resetTimer.current) clearTimeout(resetTimer.current);
      };
    }

    tickTimer.current = setTimeout(() => {
      const claim = SCRIPT_INDICES[step];
      setOwners((prev) => {
        const next = [...prev];
        next[claim.index] = claim.player;
        return next;
      });
      setLastClaim({ ...claim, tick: Date.now() });
      setStep((s) => s + 1);
    }, CLAIM_INTERVAL_MS);

    return () => {
      if (tickTimer.current) clearTimeout(tickTimer.current);
    };
  }, [active, reduced, step, reset]);

  const activePlayer: PlayerId = SCRIPT_INDICES[step % SCRIPT_INDICES.length]?.player ?? "a";
  const isClimax = step >= SHARED.winTarget;

  return { step, owners, scores, lastClaim, activePlayer, isClimax, reduced };
}

export { GOALS, SCRIPT_INDICES, SHARED };
