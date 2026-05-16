"use client";

import { useReducedMotion } from "framer-motion";
import { BlurFade } from "@/components/ui/BlurFade";
import { DottedSurface } from "@/components/ui/DottedSurface";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { TextScramble } from "@/components/ui/TextScramble";
import heroContent from "@/content/hero.json";
import type { HeroContent } from "@/content/types";

const HERO: HeroContent = heroContent as HeroContent;

const WORD_STAGGER = 0.08;
const HEADLINE_START_DELAY = 0.25;

export function Hero() {
  const reduced = useReducedMotion();

  const lineOneWords = HERO.headline.lineOne.split(" ");
  const lineTwoWords = HERO.headline.lineTwo.split(" ");
  const lineTwoOffset = lineOneWords.length;
  const wordCount = lineOneWords.length + lineTwoWords.length;

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
            phrases={HERO.eyebrowPhrases}
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
                delay={HEADLINE_START_DELAY + (lineTwoOffset + i) * WORD_STAGGER}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </BlurFade>
            ))}
          </span>
        </h1>

        <BlurFade delay={HEADLINE_START_DELAY + wordCount * WORD_STAGGER} className="mt-6">
          <p className="text-lg text-muted sm:text-xl">{HERO.subhead}</p>
        </BlurFade>

        <BlurFade
          delay={HEADLINE_START_DELAY + wordCount * WORD_STAGGER + 0.1}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <ShimmerButton href={HERO.primaryCta.href}>{HERO.primaryCta.label}</ShimmerButton>
          <ShimmerButton href={HERO.secondaryCta.href} variant="ghost">
            {HERO.secondaryCta.label}
          </ShimmerButton>
        </BlurFade>
      </div>
    </section>
  );
}
