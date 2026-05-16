export type PlayerId = "a" | "b";

export type GoalTier = "early" | "mid" | "late";

export interface Goal {
  slug: string;
  label: string;
  icon: string;
  tier: GoalTier;
}

export interface DemoClaim {
  cell: string;
  player: PlayerId;
}

export interface CtaContent {
  label: string;
  href: string;
}

export interface HeroContent {
  eyebrowPhrases: string[];
  headline: {
    lineOne: string;
    lineTwo: string;
  };
  subhead: string;
  primaryCta: CtaContent;
  secondaryCta: CtaContent;
}

export interface SharedContent {
  brand: string;
  winTarget: number;
  cellCount: number;
  footerAttribution: string;
}
