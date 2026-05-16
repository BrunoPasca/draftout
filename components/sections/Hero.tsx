"use client";

import { useReducedMotion } from "framer-motion";
import { BlurFade } from "@/components/ui/BlurFade";
import { DottedSurface } from "@/components/ui/DottedSurface";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { TextScramble } from "@/components/ui/TextScramble";

const HEADLINE_LINE_ONE = "Draft your board.";
const HEADLINE_LINE_TWO = "Race to thirteen.";
const WORD_STAGGER = 0.08;
const HEADLINE_START_DELAY = 0.25;

export function Hero() {
  const reduced = useReducedMotion();

  const lineOneWords = HEADLINE_LINE_ONE.split(" ");
  const lineTwoWords = HEADLINE_LINE_TWO.split(" ");
  const lineTwoOffset = lineOneWords.length;

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 pt-24 pb-20 sm:px-6">
      <DottedSurface interactive={!reduced} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(12,15,20,0)_0%,var(--color-surface)_85%)]"
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <BlurFade delay={0} yOffset={8} className="mb-4">
          <TextScramble
            phrases={["DRAFT", "RACE", "LOCKOUT", "WIN"]}
            intervalMs={2000}
            enabled={!reduced}
            className="inline-block font-mono text-xs uppercase tracking-[0.4em] text-emerald"
            dudClassName="text-emerald/40"
          />
        </BlurFade>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          <span className="block">
            {lineOneWords.map((word, i) => (
              <BlurFade
                key={`l1-${i}`}
                as="span"
                delay={HEADLINE_START_DELAY + i * WORD_STAGGER}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </BlurFade>
            ))}
          </span>
          <span className="block text-emerald">
            {lineTwoWords.map((word, i) => (
              <BlurFade
                key={`l2-${i}`}
                as="span"
                delay={
                  HEADLINE_START_DELAY + (lineTwoOffset + i) * WORD_STAGGER
                }
                className="mr-[0.25em] inline-block"
              >
                {word}
              </BlurFade>
            ))}
          </span>
        </h1>

        <BlurFade
          delay={
            HEADLINE_START_DELAY +
            (lineOneWords.length + lineTwoWords.length) * WORD_STAGGER
          }
          className="mt-6"
        >
          <p className="text-lg text-muted sm:text-xl">
            Competitive lockout bingo for two players — identical worlds, same
            seed, first to complete 13 of 25 drafted goals wins.
          </p>
        </BlurFade>

        <BlurFade
          delay={
            HEADLINE_START_DELAY +
            (lineOneWords.length + lineTwoWords.length) * WORD_STAGGER +
            0.1
          }
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <ShimmerButton href="#cta">Play free</ShimmerButton>
          <ShimmerButton href="#board" variant="ghost">
            See the board
          </ShimmerButton>
        </BlurFade>
      </div>
    </section>
  );
}
