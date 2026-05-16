"use client";

import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import heroContent from "@/content/hero.json";
import type { HeroContent } from "@/content/types";

const HERO: HeroContent = heroContent as HeroContent;

export function Hero() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc={HERO.media ?? "/hero/media.jpg"}
      bgImageSrc={HERO.bgImage ?? "/hero/bg.jpg"}
      title={HERO.title ?? "DRAFTOUT"}
      date={HERO.tagline ?? "Minecraft 1v1"}
      scrollToExpand={HERO.scrollPrompt ?? "Scroll to expand"}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-10 text-lg text-foreground sm:text-xl">
          {HERO.subhead}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ShimmerButton href={HERO.primaryCta.href}>
            {HERO.primaryCta.label}
          </ShimmerButton>
          <ShimmerButton href={HERO.secondaryCta.href} variant="ghost">
            {HERO.secondaryCta.label}
          </ShimmerButton>
        </div>
        <p className="mt-12 text-sm text-muted">
          Continue scrolling to see how it works
        </p>
      </div>
    </ScrollExpandMedia>
  );
}
