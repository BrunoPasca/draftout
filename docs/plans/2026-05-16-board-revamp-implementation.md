# Board Cinematic Trailer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 2D BingoGrid + 3D crafting table overlay with a single cinematic mini-trailer where 25 pixel-art cells live ON the crafting-table top in 3D, a camera dollies through scripted claims, and the 13th claim triggers a signature LOCKOUT beat.

**Architecture:** R3F scene (camera rig + table + 25 emissive cell planes + particle pool) synchronized with a screen-space HUD overlay (BorderBeam frame, score flip, claim ticker, lockout stamp). Single `useBoardTimeline()` hook drives both layers via the existing `BoardClaimProvider`. All editable content lives in `/content/*.json` + `/public/board/icons/*.png` — no copy or asset is hardcoded in components.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · @react-three/fiber 9 · @react-three/drei 10 · **+@react-three/postprocessing (NEW dep)** · Three.js 0.184. 21st.dev components sourced via Magic MCP per `CLAUDE.md`.

**Design source of truth:** `docs/plans/2026-05-16-board-revamp-design.md` (commit `d26cad0`).

---

## Verification approach (adapted)

The Draftout project has **no test runner installed** (no jest, vitest, playwright). Introducing one is out of scope. The "test" gate for every code-producing step in this plan is:

1. **TypeScript compilation** — `npx tsc --noEmit` must pass after the edit.
2. **ESLint** — `npx next lint` must produce no new errors.
3. **Dev server visual check** — `npm run dev` (already running on :3000) must serve `/` with HTTP 200 and no console errors. Specific visual checks are called out per task.
4. **Production build** — `npx next build` must succeed at end of plan.

Where a step says "Verify:", treat it as the test gate for that step. If a verification fails, stop and fix before continuing.

---

## Heads-up: pre-existing uncommitted work

There is uncommitted Hero work from the prior session sitting on `main`:
- `components/sections/Hero.tsx` (modified)
- `components/ui/BlurFade.tsx`, `DottedSurface.tsx`, `ShimmerButton.tsx`, `TextScramble.tsx` (new)
- Untracked: `.env.example`, `CLAUDE.md`, `tsconfig.tsbuildinfo`

**Phase 0** below commits the Hero work first as a clean checkpoint so the Board revamp is its own bisectable history. Do not skip Phase 0.

---

## File structure

### New files
```
content/types.ts                                # shared types for JSON content
content/board/goals.json                        # 25 goals: { slug, label, icon, tier }
content/board/demo-script.json                  # 13 claims, slug-keyed
content/hero.json                               # eyebrow phrases, h1 lines, CTA copy
content/shared.json                             # brand, winTarget, attribution

public/board/icons/{25 PNGs}                    # Faithful-sourced 16×16 icons
public/board/CREDITS.md                         # Faithful attribution

components/ui/BorderBeam.tsx                    # 21st.dev Magic UI Border Beam, themed
components/board/BoardScene.tsx                 # R3F Canvas wrapper (replaces BoardCanvas)
components/board/scene/CraftingTable.tsx        # table base only (top is BoardSurface)
components/board/scene/BoardSurface.tsx         # 5×5 grid of BoardCell3D
components/board/scene/BoardCell3D.tsx          # one textured cell plane
components/board/scene/ClaimParticles.tsx       # instanced spark pool
components/board/scene/CameraRig.tsx            # spring-lerped camera target
components/board/hud/BoardHud.tsx               # HUD overlay container
components/board/hud/ScoreFlip.tsx              # animated number flip per player
components/board/hud/ClaimTicker.tsx            # marquee feed of recent claims
components/board/hud/LockoutStamp.tsx           # clip-path slide on climax

lib/board-icons.ts                              # icon atlas builder
lib/board-timeline.ts                           # useBoardTimeline() hook
```

### Modified files
```
components/sections/Hero.tsx                    # consume content/hero.json
components/sections/Board.tsx                   # add BorderBeam frame
components/board/BoardShowcase.tsx              # rewire to BoardScene + BoardHud
components/sections/FooterCta.tsx               # add Faithful credit line
lib/board-demo.ts                               # trim to types only (BOARD_GOALS, DEMO_CLAIMS → JSON)
package.json + package-lock.json                # +@react-three/postprocessing
```

### Deleted files (in the switchover commit)
```
components/board/BoardCanvas.tsx
components/board/CraftingTableModel.tsx
components/board/BingoGrid.tsx
components/board/BoardCell.tsx
components/board/BoardProgress.tsx
```

---

# Phase 0 — Stabilize working tree

## Task 0.1: Commit pending Hero work

**Files:**
- Existing modifications/additions from prior session (see "Heads-up" above).

- [ ] **Step 1: Inspect current state**

Run:
```bash
git status
```
Expected: `components/sections/Hero.tsx` modified, 4 new files under `components/ui/`, plus untracked `.env.example`, `CLAUDE.md`, `tsconfig.tsbuildinfo`.

- [ ] **Step 2: Stage Hero-only files (do NOT stage build artifacts or root configs in this commit)**

Run:
```bash
git add components/sections/Hero.tsx \
        components/ui/BlurFade.tsx \
        components/ui/DottedSurface.tsx \
        components/ui/ShimmerButton.tsx \
        components/ui/TextScramble.tsx
```

- [ ] **Step 3: Commit Hero checkpoint**

Run:
```bash
git commit -m "$(cat <<'EOF'
Revamp Hero with 21st.dev components.

Dotted-surface canvas background with cursor bloom replaces the radial
gradient pulse. TextScramble cycles "DRAFT · RACE · LOCKOUT · WIN" on a
2s interval. BlurFade per-word stagger across the H1. ShimmerButton
primary CTA with white/30 sweep, ghost variant for the secondary.

All four sourced via Magic MCP from 21st.dev and adapted to Tailwind v4
tokens (--color-emerald, --color-surface, --color-border). Reduced
motion gates the cursor tracking, scramble, blur, and shimmer.
EOF
)"
```

- [ ] **Step 4: Verify clean tree**

Run:
```bash
git status --short
```
Expected: only `?? .env.example`, `?? CLAUDE.md`, `?? tsconfig.tsbuildinfo` remain — none are part of this plan.

- [ ] **Step 5: Optional — stash or .gitignore the build artifact**

Run:
```bash
echo "tsconfig.tsbuildinfo" >> .gitignore && git add .gitignore && git commit -m "Ignore tsconfig.tsbuildinfo build artifact."
```
Skip if `.gitignore` already excludes it.

- [ ] **Step 6: Verify**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

---

# Phase 1 — Content scaffolding

Move all editable text + asset references into `/content/*.json`. After this phase, a non-dev can edit copy and add/remove goals without touching component code.

## Task 1.1: Define content types

**Files:**
- Create: `content/types.ts`

- [ ] **Step 1: Create the types file**

Create `content/types.ts`:
```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/types.ts
git commit -m "Add content type definitions for editable JSON layer."
```

## Task 1.2: Author goals.json

**Files:**
- Create: `content/board/goals.json`

Mapping decisions: 25 goals derived from the existing `BOARD_GOALS` array in `lib/board-demo.ts`. Each gets a slug, the icon filename (matches a future PNG in `public/board/icons/`), and a tier classification.

- [ ] **Step 1: Create goals.json**

Create `content/board/goals.json`:
```json
[
  { "slug": "stone-pick",     "label": "Stone pickaxe",  "icon": "stone-pick",     "tier": "early" },
  { "slug": "iron-ingot",     "label": "Iron ingot",     "icon": "iron-ingot",     "tier": "early" },
  { "slug": "lava-bucket",    "label": "Lava bucket",    "icon": "lava-bucket",    "tier": "early" },
  { "slug": "wheat-farm",     "label": "Wheat farm",     "icon": "wheat-farm",     "tier": "early" },
  { "slug": "bed",            "label": "Bed",            "icon": "bed",            "tier": "early" },
  { "slug": "zombie-kill",    "label": "Zombie kill",    "icon": "zombie-kill",    "tier": "early" },
  { "slug": "diamond",        "label": "Diamond",        "icon": "diamond",        "tier": "mid"   },
  { "slug": "enchant-table",  "label": "Enchant table",  "icon": "enchant-table",  "tier": "mid"   },
  { "slug": "village",        "label": "Village",        "icon": "village",        "tier": "early" },
  { "slug": "boat",           "label": "Boat",           "icon": "boat",           "tier": "early" },
  { "slug": "nether-portal",  "label": "Nether portal",  "icon": "nether-portal",  "tier": "mid"   },
  { "slug": "blaze-rod",      "label": "Blaze rod",      "icon": "blaze-rod",      "tier": "mid"   },
  { "slug": "brew-potion",    "label": "Brew potion",    "icon": "brew-potion",    "tier": "mid"   },
  { "slug": "ender-pearl",    "label": "Ender pearl",    "icon": "ender-pearl",    "tier": "mid"   },
  { "slug": "stronghold",     "label": "Stronghold",     "icon": "stronghold",     "tier": "late"  },
  { "slug": "golden-apple",   "label": "Golden apple",   "icon": "golden-apple",   "tier": "mid"   },
  { "slug": "tame-wolf",      "label": "Tame wolf",      "icon": "tame-wolf",      "tier": "early" },
  { "slug": "ocean-monument", "label": "Ocean monument", "icon": "ocean-monument", "tier": "late"  },
  { "slug": "map",            "label": "Map",            "icon": "map",            "tier": "early" },
  { "slug": "anvil",          "label": "Anvil",          "icon": "anvil",          "tier": "mid"   },
  { "slug": "beacon",         "label": "Beacon",         "icon": "beacon",         "tier": "late"  },
  { "slug": "elytra",         "label": "Elytra",         "icon": "elytra",         "tier": "late"  },
  { "slug": "dragon-egg",     "label": "Dragon egg",     "icon": "dragon-egg",     "tier": "late"  },
  { "slug": "shulker-box",    "label": "Shulker box",    "icon": "shulker-box",    "tier": "late"  },
  { "slug": "totem",          "label": "Totem",          "icon": "totem",          "tier": "mid"   }
]
```

- [ ] **Step 2: Verify import + types**

Create a temporary type-check script to make sure JSON imports type-narrow against `Goal[]`:
```bash
cat > /tmp/check-goals.ts <<'EOF'
import goals from "@/content/board/goals.json";
import type { Goal } from "@/content/types";
const _typed: Goal[] = goals as Goal[];
console.log(`OK: ${_typed.length} goals, first slug=${_typed[0].slug}`);
EOF
npx tsc --noEmit
```
Expected: no errors. Delete temp file: `rm /tmp/check-goals.ts`.

- [ ] **Step 3: Commit**

```bash
git add content/board/goals.json
git commit -m "Add content/board/goals.json with 25 goal definitions."
```

## Task 1.3: Author demo-script.json

**Files:**
- Create: `content/board/demo-script.json`

Mirrors the existing `DEMO_CLAIMS` in `lib/board-demo.ts`, but slug-keyed instead of index-keyed (more edit-friendly).

- [ ] **Step 1: Create demo-script.json**

Create `content/board/demo-script.json`:
```json
[
  { "cell": "stone-pick",   "player": "a" },
  { "cell": "zombie-kill",  "player": "b" },
  { "cell": "diamond",      "player": "a" },
  { "cell": "nether-portal", "player": "b" },
  { "cell": "lava-bucket",  "player": "a" },
  { "cell": "blaze-rod",    "player": "b" },
  { "cell": "tame-wolf",    "player": "a" },
  { "cell": "iron-ingot",   "player": "b" },
  { "cell": "brew-potion",  "player": "a" },
  { "cell": "enchant-table","player": "b" },
  { "cell": "wheat-farm",   "player": "a" },
  { "cell": "stronghold",   "player": "b" },
  { "cell": "village",      "player": "a" }
]
```
This matches the index-based existing DEMO_CLAIMS one-for-one (verified against `lib/board-demo.ts:37-51`).

- [ ] **Step 2: Verify**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/board/demo-script.json
git commit -m "Add content/board/demo-script.json with 13-claim scripted timeline."
```

## Task 1.4: Author hero.json

**Files:**
- Create: `content/hero.json`

Captures the strings currently hardcoded as constants in `components/sections/Hero.tsx`. The Hero refactor to consume this file lands in Task 1.6.

- [ ] **Step 1: Create hero.json**

Create `content/hero.json`:
```json
{
  "eyebrowPhrases": ["DRAFT", "RACE", "LOCKOUT", "WIN"],
  "headline": {
    "lineOne": "Draft your board.",
    "lineTwo": "Race to thirteen."
  },
  "subhead": "Competitive lockout bingo for two players — identical worlds, same seed, first to complete 13 of 25 drafted goals wins.",
  "primaryCta": { "label": "Play free", "href": "#cta" },
  "secondaryCta": { "label": "See the board", "href": "#board" }
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/hero.json
git commit -m "Add content/hero.json with editable Hero copy."
```

## Task 1.5: Author shared.json

**Files:**
- Create: `content/shared.json`

- [ ] **Step 1: Create shared.json**

Create `content/shared.json`:
```json
{
  "brand": "Draftout",
  "winTarget": 13,
  "cellCount": 25,
  "footerAttribution": "Goal icons adapted from the Faithful x16 resource pack (CC-BY-4.0)."
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add content/shared.json
git commit -m "Add content/shared.json with brand strings and attribution."
```

## Task 1.6: Refactor Hero.tsx to consume content/hero.json

**Files:**
- Modify: `components/sections/Hero.tsx`

- [ ] **Step 1: Replace Hero.tsx**

Replace the contents of `components/sections/Hero.tsx`:
```tsx
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
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npx next lint --quiet
```
Expected: no errors.

- [ ] **Step 3: Visual confirm**

Open http://localhost:3000 (dev server already running). Hero must look identical to before — same eyebrow cycle, same headline, same CTAs. If anything changed visually, revert and inspect the JSON.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Hero.tsx
git commit -m "Refactor Hero to consume content/hero.json (no behavior change)."
```

## Task 1.7: Download Faithful icons

**Files:**
- Create: 25 PNGs at `public/board/icons/*.png`
- Create: `public/board/CREDITS.md`

The Faithful x16 pack lives at `github.com/Faithful-Resource-Pack/Faithful-Java-16x` under CC-BY-4.0. We fetch each PNG individually from raw.githubusercontent.com.

- [ ] **Step 1: Create icon directory**

Run:
```bash
mkdir -p public/board/icons
```

- [ ] **Step 2: Download 25 icons**

Run this script (copy-paste verbatim — it iterates through (Faithful path, target slug) pairs):
```bash
cd public/board/icons
BASE="https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-Java-16x/java/assets/minecraft/textures"
# pairs: <source-path-relative-to-textures>|<destination-slug>
pairs=(
  "item/stone_pickaxe.png|stone-pick.png"
  "item/iron_ingot.png|iron-ingot.png"
  "item/lava_bucket.png|lava-bucket.png"
  "block/wheat_stage7.png|wheat-farm.png"
  "item/red_bed.png|bed.png"
  "item/zombie_head.png|zombie-kill.png"
  "item/diamond.png|diamond.png"
  "block/enchanting_table_top.png|enchant-table.png"
  "block/bell_bottom.png|village.png"
  "item/oak_boat.png|boat.png"
  "block/obsidian.png|nether-portal.png"
  "item/blaze_rod.png|blaze-rod.png"
  "item/potion.png|brew-potion.png"
  "item/ender_pearl.png|ender-pearl.png"
  "block/end_portal_frame_top.png|stronghold.png"
  "item/golden_apple.png|golden-apple.png"
  "item/bone.png|tame-wolf.png"
  "block/prismarine_bricks.png|ocean-monument.png"
  "item/filled_map.png|map.png"
  "block/anvil_top.png|anvil.png"
  "block/beacon.png|beacon.png"
  "item/elytra.png|elytra.png"
  "block/dragon_egg.png|dragon-egg.png"
  "block/shulker_box.png|shulker-box.png"
  "item/totem_of_undying.png|totem.png"
)
for p in "${pairs[@]}"; do
  src="${p%%|*}"; dst="${p##*|}"
  curl -sSfLo "$dst" "$BASE/$src" || echo "FAIL: $src"
done
ls -1 | wc -l   # expect: 25
cd ../../..
```
Expected: 25 PNGs, all ≤500 bytes each (16×16 is tiny). If any line prints `FAIL`, the upstream filename may have changed — search https://github.com/Faithful-Resource-Pack/Faithful-Java-16x/tree/java/assets/minecraft/textures for the closest match and edit the `pairs` list.

- [ ] **Step 3: Smoke-check the icons load**

Run:
```bash
file public/board/icons/*.png | head -3
```
Expected: each line ends with `PNG image data, 16 x 16, ...` (or similar; some block textures may be 32×32 — that's fine, they'll be sampled down).

- [ ] **Step 4: Create credits file**

Create `public/board/CREDITS.md`:
```markdown
# Board icon credits

The 25 pixel-art goal icons in `public/board/icons/` are derived from the
**Faithful x16** resource pack, licensed under **CC-BY-4.0**.

- Source: https://github.com/Faithful-Resource-Pack/Faithful-Java-16x
- License: https://creativecommons.org/licenses/by/4.0/

Faithful is a community resource pack that recreates Minecraft's default
textures at 16×16 with cleaner palettes. Icons may have been renamed or
selected to match Draftout's goal vocabulary.
```

- [ ] **Step 5: Commit**

```bash
git add public/board/icons public/board/CREDITS.md
git commit -m "Add 25 Faithful x16 board icons (CC-BY-4.0) and credits."
```

## Task 1.8: Footer credit line

**Files:**
- Modify: `components/sections/FooterCta.tsx`

- [ ] **Step 1: Update FooterCta.tsx**

Read `components/sections/FooterCta.tsx`. Replace the existing footer paragraph (currently `© {year} Draftout · Minecraft fan project`) with a two-line version that includes the Faithful attribution.

Replace lines 31-33:
```tsx
        <p className="mt-12 text-sm text-muted">
          © {new Date().getFullYear()} Draftout · Minecraft fan project
        </p>
```
With:
```tsx
        <p className="mt-12 text-sm text-muted">
          © {new Date().getFullYear()} Draftout · Minecraft fan project
        </p>
        <p className="mt-2 text-xs text-muted/70">
          {shared.footerAttribution}
        </p>
```

Add the import at the top of the file (after the existing imports):
```tsx
import sharedContent from "@/content/shared.json";
import type { SharedContent } from "@/content/types";

const shared: SharedContent = sharedContent as SharedContent;
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Visual confirm**

Open http://localhost:3000, scroll to footer. Two paragraphs visible: copyright + Faithful credit.

- [ ] **Step 4: Commit**

```bash
git add components/sections/FooterCta.tsx
git commit -m "Credit Faithful pack in footer; consume shared.json."
```

---

# Phase 2 — BorderBeam component

The 21st.dev Magic UI Border Beam was sourced during design (`mcp__magic__21st_magic_component_inspiration` query "border beam card"). It uses CSS `offset-path` for an animated traveling glow. Adapted to Draftout tokens.

## Task 2.1: BorderBeam component

**Files:**
- Create: `components/ui/BorderBeam.tsx`

- [ ] **Step 1: Create BorderBeam.tsx**

Create `components/ui/BorderBeam.tsx`:
```tsx
"use client";

import type { CSSProperties } from "react";

type BorderBeamProps = {
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  className?: string;
};

export function BorderBeam({
  size = 250,
  duration = 14,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "var(--color-emerald)",
  colorTo = "var(--color-amber)",
  delay = 0,
  className = "",
}: BorderBeamProps) {
  return (
    <div
      aria-hidden
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as CSSProperties
      }
      className={[
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "[border:calc(var(--border-width)*1px)_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect]",
        "[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)]",
        "after:animate-[border-beam_calc(var(--duration)*1s)_infinite_linear]",
        "after:[animation-delay:var(--delay)]",
        "after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]",
        "after:[offset-anchor:calc(var(--anchor)*1%)_50%]",
        "after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className,
      ].join(" ")}
    />
  );
}
```

- [ ] **Step 2: Add the `border-beam` keyframe**

The component references `animate-[border-beam_...]` but CLAUDE.md bans CSS keyframes for UI motion. BorderBeam is a decorative ambient effect (not UI state animation), so a minimal `@keyframes` in `app/globals.css` is acceptable — but document the exception.

Open `app/globals.css`. After the existing `@theme` block (line 15), append:
```css
/* Ambient decorative motion exception (per docs/plans/2026-05-16-board-revamp-design.md):
   BorderBeam needs offset-path animation, which Framer Motion can't drive directly. */
@keyframes border-beam {
  100% { offset-distance: 100%; }
}
```

Final file should look like:
```css
@import "tailwindcss";

@theme {
  --color-surface: #0c0f14;
  --color-surface-raised: #141a24;
  --color-border: #2a3548;
  --color-muted: #8b9cb3;
  --color-foreground: #eef2f7;
  --color-emerald: #3dd68c;
  --color-amber: #f5b942;
  --color-player-a: #5b9fd4;
  --color-player-b: #e07a5f;
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}

/* Ambient decorative motion exception (per docs/plans/2026-05-16-board-revamp-design.md):
   BorderBeam needs offset-path animation, which Framer Motion can't drive directly. */
@keyframes border-beam {
  100% { offset-distance: 100%; }
}

html { scroll-behavior: smooth; }
body {
  background: var(--color-surface);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/BorderBeam.tsx app/globals.css
git commit -m "Add themed BorderBeam component for canvas framing."
```

---

# Phase 3 — 3D scene primitives

## Task 3.1: Install @react-three/postprocessing

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install**

Run:
```bash
npm install @react-three/postprocessing@^3.0.4
```
(Pin to the v3 line for R3F 9 compatibility; check `https://www.npmjs.com/package/@react-three/postprocessing` if install fails — peer deps on `@react-three/fiber: ^9` are required.)

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
node -e "console.log(require('@react-three/postprocessing/package.json').version)"
```
Expected: prints the installed version; no TS errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add @react-three/postprocessing for Board climax effects."
```

## Task 3.2: Icon atlas loader

**Files:**
- Create: `lib/board-icons.ts`

Build a single 80×80 atlas (5×5 grid of 16×16 cells) at module init, expose per-slug UV offsets. All 25 cells share one `MeshStandardMaterial` referencing this atlas — drops 25 draw calls to 1.

- [ ] **Step 1: Create lib/board-icons.ts**

Create `lib/board-icons.ts`:
```ts
"use client";

import * as THREE from "three";
import goalsJson from "@/content/board/goals.json";
import type { Goal } from "@/content/types";

const GOALS: Goal[] = goalsJson as Goal[];

export const ATLAS_GRID = 5;          // 5×5 atlas matches 5×5 board
export const TILE_PX = 16;            // each tile is 16×16 source px (Faithful native)
export const ATLAS_PX = ATLAS_GRID * TILE_PX;

export type AtlasUv = {
  /** UV offset in [0,1] for the bottom-left corner of this tile in the atlas. */
  offset: [number, number];
  /** UV repeat — always 1/ATLAS_GRID. */
  repeat: [number, number];
};

export type IconAtlas = {
  texture: THREE.CanvasTexture;
  uvBySlug: Record<string, AtlasUv>;
  uvByIndex: AtlasUv[];
};

let _atlasPromise: Promise<IconAtlas> | null = null;

/** Build (or return) the singleton atlas. SSR-safe: returns a noop on the server. */
export function loadBoardIconAtlas(): Promise<IconAtlas> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadBoardIconAtlas: client-only"));
  }
  if (_atlasPromise) return _atlasPromise;

  _atlasPromise = (async () => {
    const canvas = document.createElement("canvas");
    canvas.width = ATLAS_PX;
    canvas.height = ATLAS_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("loadBoardIconAtlas: 2d ctx unavailable");
    ctx.imageSmoothingEnabled = false;
    // Fill transparent (default for canvas).

    const uvBySlug: Record<string, AtlasUv> = {};
    const uvByIndex: AtlasUv[] = [];

    await Promise.all(
      GOALS.map((goal, index) => {
        const col = index % ATLAS_GRID;
        const row = Math.floor(index / ATLAS_GRID);
        return loadImage(`/board/icons/${goal.icon}.png`).then((img) => {
          // Source images may be 16×16 or 32×32 (some block textures). Either way,
          // draw into a 16×16 cell — the browser will downsample with nearest neighbour
          // because imageSmoothingEnabled is false.
          ctx.drawImage(img, col * TILE_PX, row * TILE_PX, TILE_PX, TILE_PX);

          // UVs: THREE uses bottom-left origin, canvas uses top-left.
          const u = col / ATLAS_GRID;
          const v = 1 - (row + 1) / ATLAS_GRID;
          const uv: AtlasUv = {
            offset: [u, v],
            repeat: [1 / ATLAS_GRID, 1 / ATLAS_GRID],
          };
          uvBySlug[goal.slug] = uv;
          uvByIndex[index] = uv;
        });
      }),
    );

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    return { texture, uvBySlug, uvByIndex };
  })();

  return _atlasPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export { GOALS };
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/board-icons.ts
git commit -m "Add lib/board-icons.ts atlas builder for 25 goal textures."
```

## Task 3.3: BoardCell3D — single textured cell

**Files:**
- Create: `components/board/scene/BoardCell3D.tsx`

- [ ] **Step 1: Create BoardCell3D.tsx**

Create `components/board/scene/BoardCell3D.tsx`:
```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { AtlasUv } from "@/lib/board-icons";
import type { PlayerId } from "@/content/types";

const PLAYER_COLORS: Record<PlayerId, THREE.Color> = {
  a: new THREE.Color("#5b9fd4"),
  b: new THREE.Color("#e07a5f"),
};
const NEUTRAL_COLOR = new THREE.Color("#1b232f");
const EMISSIVE_BASE = new THREE.Color("#000000");

type BoardCell3DProps = {
  position: [number, number, number];
  size: number;
  atlasTexture: THREE.CanvasTexture;
  atlasUv: AtlasUv;
  owner: PlayerId | null;
  isLatest: boolean;
};

export function BoardCell3D({
  position,
  size,
  atlasTexture,
  atlasUv,
  owner,
  isLatest,
}: BoardCell3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const pulseRef = useRef(0);

  // Clone the atlas texture per cell so each can have its own UV offset/repeat.
  const texture = useMemo(() => {
    const t = atlasTexture.clone();
    t.needsUpdate = true;
    t.offset.set(atlasUv.offset[0], atlasUv.offset[1]);
    t.repeat.set(atlasUv.repeat[0], atlasUv.repeat[1]);
    return t;
  }, [atlasTexture, atlasUv]);

  useEffect(() => {
    if (isLatest) pulseRef.current = 1;
  }, [isLatest]);

  useFrame((_, delta) => {
    if (!matRef.current) return;

    const targetTint = owner ? PLAYER_COLORS[owner] : NEUTRAL_COLOR;
    matRef.current.color.lerp(targetTint, Math.min(1, delta * 4));

    if (pulseRef.current > 0) {
      pulseRef.current = Math.max(0, pulseRef.current - delta * 2.2);
      const intensity = pulseRef.current * 1.4;
      matRef.current.emissive.copy(owner ? PLAYER_COLORS[owner] : EMISSIVE_BASE);
      matRef.current.emissiveIntensity = intensity;
    } else {
      matRef.current.emissiveIntensity = owner ? 0.18 : 0;
      if (owner) matRef.current.emissive.copy(PLAYER_COLORS[owner]);
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        transparent
        alphaTest={0.1}
        roughness={0.6}
        metalness={0.05}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/scene/BoardCell3D.tsx
git commit -m "Add BoardCell3D — single textured cell plane with owner tint."
```

## Task 3.4: BoardSurface — 5×5 grid layout

**Files:**
- Create: `components/board/scene/BoardSurface.tsx`

- [ ] **Step 1: Create BoardSurface.tsx**

Create `components/board/scene/BoardSurface.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { BoardCell3D } from "@/components/board/scene/BoardCell3D";
import { GOALS, type IconAtlas, loadBoardIconAtlas } from "@/lib/board-icons";
import type { PlayerId } from "@/content/types";

type BoardSurfaceProps = {
  owners: (PlayerId | null)[];
  latestIndex: number | null;
  surfaceY?: number;
};

const GRID = 5;
const CELL_GAP = 0.05;
const SURFACE_WIDTH = 1.2;       // matches old table top width
const CELL_SIZE = (SURFACE_WIDTH - CELL_GAP * (GRID - 1)) / GRID;

export function BoardSurface({ owners, latestIndex, surfaceY = 0.54 }: BoardSurfaceProps) {
  const [atlas, setAtlas] = useState<IconAtlas | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadBoardIconAtlas().then((a) => {
      if (!cancelled) setAtlas(a);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!atlas) return null;

  return (
    <group>
      {GOALS.map((goal, index) => {
        const col = index % GRID;
        const row = Math.floor(index / GRID);
        const x = (col - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
        const z = (row - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
        return (
          <BoardCell3D
            key={goal.slug}
            position={[x, surfaceY, z]}
            size={CELL_SIZE}
            atlasTexture={atlas.texture}
            atlasUv={atlas.uvBySlug[goal.slug]}
            owner={owners[index] ?? null}
            isLatest={latestIndex === index}
          />
        );
      })}
    </group>
  );
}

export { CELL_SIZE, CELL_GAP, GRID, SURFACE_WIDTH };
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/scene/BoardSurface.tsx
git commit -m "Add BoardSurface — 5×5 grid layout of BoardCell3D meshes."
```

## Task 3.5: CraftingTable — base only

**Files:**
- Create: `components/board/scene/CraftingTable.tsx`

Port the plank texture from the old `CraftingTableModel.tsx` but drop the top mesh — `BoardSurface` IS the top now.

- [ ] **Step 1: Create CraftingTable.tsx**

Create `components/board/scene/CraftingTable.tsx`:
```tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";

function buildPlankTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("plank texture: 2d ctx unavailable");
  ctx.fillStyle = "#5a3d1e";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#a67c3d";
  for (let y = 0; y < 64; y += 8) ctx.fillRect(0, y, 64, 6);
  ctx.strokeStyle = "#5a3d1e";
  ctx.lineWidth = 1;
  for (let x = 0; x < 64; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 64);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function CraftingTable() {
  const plankTex = useMemo(buildPlankTexture, []);

  return (
    <group position={[0, -0.1, 0]} scale={1.15}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.45, 1.1]} />
        <meshStandardMaterial map={plankTex} roughness={0.75} />
      </mesh>
      {/* Slim wood rim around the board surface, to frame the cells visually. */}
      <mesh position={[0, 0.46, 0]} receiveShadow>
        <boxGeometry args={[1.26, 0.04, 1.26]} />
        <meshStandardMaterial color="#3a2810" roughness={0.85} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/scene/CraftingTable.tsx
git commit -m "Add CraftingTable scene component (base only; top is BoardSurface)."
```

## Task 3.6: BoardScene wrapper (minimal — no camera rig yet)

**Files:**
- Create: `components/board/BoardScene.tsx`

- [ ] **Step 1: Create BoardScene.tsx**

Create `components/board/BoardScene.tsx`:
```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { BoardSurface } from "@/components/board/scene/BoardSurface";
import { CraftingTable } from "@/components/board/scene/CraftingTable";
import type { PlayerId } from "@/content/types";

type BoardSceneProps = {
  active: boolean;
  owners: (PlayerId | null)[];
  latestIndex: number | null;
  className?: string;
};

export function BoardScene({ active, owners, latestIndex, className }: BoardSceneProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={`${className ?? ""} relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.15),rgba(12,15,20,0.4)_65%)]`}
      aria-hidden
    >
      <Canvas
        camera={{ position: [2.4, 2, 2.6], fov: 40 }}
        dpr={[1, reduced ? 1 : 2]}
        frameloop={active ? "always" : "demand"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[5, 8, 4]} intensity={1.65} castShadow />
        <directionalLight position={[-4, 3, -2]} intensity={0.55} />
        <pointLight position={[0, 2.5, 2]} intensity={1} color="#3dd68c" />
        <CraftingTable />
        <BoardSurface owners={owners} latestIndex={latestIndex} />
        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.55}
          scale={3.2}
          blur={2}
          far={1.4}
        />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/BoardScene.tsx
git commit -m "Add BoardScene wrapper — table + 25-cell surface, no camera rig yet."
```

---

# Phase 4 — 3D scene motion

## Task 4.1: useBoardTimeline hook

**Files:**
- Create: `lib/board-timeline.ts`

Single source of truth for the 12s scripted loop. Both 3D scene and HUD subscribe.

- [ ] **Step 1: Create lib/board-timeline.ts**

Create `lib/board-timeline.ts`:
```ts
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

    if (step >= SCRIPT_INDICES.length || scores.a >= SHARED.winTarget || scores.b >= SHARED.winTarget) {
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
  }, [active, reduced, step, scores.a, scores.b, reset]);

  const activePlayer: PlayerId = SCRIPT_INDICES[step % SCRIPT_INDICES.length]?.player ?? "a";
  const isClimax = step >= SHARED.winTarget;

  return { step, owners, scores, lastClaim, activePlayer, isClimax, reduced };
}

export { GOALS, SCRIPT_INDICES, SHARED };
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/board-timeline.ts
git commit -m "Add useBoardTimeline hook — single source of truth for 12s scripted loop."
```

## Task 4.2: CameraRig — spring-lerped camera target

**Files:**
- Create: `components/board/scene/CameraRig.tsx`

- [ ] **Step 1: Create CameraRig.tsx**

Create `components/board/scene/CameraRig.tsx`:
```tsx
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import { CELL_GAP, CELL_SIZE, GRID } from "@/components/board/scene/BoardSurface";
import type { ClaimEvent } from "@/lib/board-timeline";

const WIDE_POS: [number, number, number] = [2.4, 2.0, 2.6];
const WIDE_TARGET: [number, number, number] = [0, 0.4, 0];
const CLIMAX_POS: [number, number, number] = [0.0, 1.2, 2.0];
const CLIMAX_TARGET: [number, number, number] = [0, 0.5, 0];

const SPRING = { stiffness: 60, damping: 16, mass: 1 };

type CameraRigProps = {
  lastClaim: ClaimEvent | null;
  isClimax: boolean;
  active: boolean;
  reduced: boolean;
};

function cellWorldPos(index: number): [number, number, number] {
  const col = index % GRID;
  const row = Math.floor(index / GRID);
  const x = (col - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
  const z = (row - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
  return [x, 0.54, z];
}

export function CameraRig({ lastClaim, isClimax, active, reduced }: CameraRigProps) {
  const { camera } = useThree();
  const orbitT = useRef(0);

  const posX = useMotionValue(WIDE_POS[0]);
  const posY = useMotionValue(WIDE_POS[1]);
  const posZ = useMotionValue(WIDE_POS[2]);
  const tgtX = useMotionValue(WIDE_TARGET[0]);
  const tgtY = useMotionValue(WIDE_TARGET[1]);
  const tgtZ = useMotionValue(WIDE_TARGET[2]);

  const sx = useSpring(posX, SPRING);
  const sy = useSpring(posY, SPRING);
  const sz = useSpring(posZ, SPRING);
  const stx = useSpring(tgtX, SPRING);
  const sty = useSpring(tgtY, SPRING);
  const stz = useSpring(tgtZ, SPRING);

  // Drive springs from claim events.
  useEffect(() => {
    if (reduced) {
      posX.set(WIDE_POS[0]);
      posY.set(WIDE_POS[1]);
      posZ.set(WIDE_POS[2]);
      tgtX.set(WIDE_TARGET[0]);
      tgtY.set(WIDE_TARGET[1]);
      tgtZ.set(WIDE_TARGET[2]);
      return;
    }

    if (isClimax) {
      posX.set(CLIMAX_POS[0]);
      posY.set(CLIMAX_POS[1]);
      posZ.set(CLIMAX_POS[2]);
      tgtX.set(CLIMAX_TARGET[0]);
      tgtY.set(CLIMAX_TARGET[1]);
      tgtZ.set(CLIMAX_TARGET[2]);
      return;
    }

    if (lastClaim) {
      const [cx, , cz] = cellWorldPos(lastClaim.index);
      // Dolly slightly toward the claimed cell relative to the orbit centre.
      posX.set(WIDE_POS[0] + cx * 0.5);
      posY.set(WIDE_POS[1]);
      posZ.set(WIDE_POS[2] + cz * 0.5);
      tgtX.set(cx * 0.4);
      tgtY.set(0.45);
      tgtZ.set(cz * 0.4);
    } else {
      posX.set(WIDE_POS[0]);
      posY.set(WIDE_POS[1]);
      posZ.set(WIDE_POS[2]);
      tgtX.set(WIDE_TARGET[0]);
      tgtY.set(WIDE_TARGET[1]);
      tgtZ.set(WIDE_TARGET[2]);
    }
  }, [lastClaim, isClimax, reduced, posX, posY, posZ, tgtX, tgtY, tgtZ]);

  useFrame((_, delta) => {
    if (!active) return;

    // Apply spring values to camera.
    let baseX = sx.get();
    let baseZ = sz.get();

    // Idle orbit overlay — only when no claim is fresh and not in climax.
    if (!reduced && !isClimax && !lastClaim) {
      orbitT.current += delta * 0.35;
      const radius = Math.hypot(baseX, baseZ);
      baseX = Math.cos(orbitT.current) * radius;
      baseZ = Math.sin(orbitT.current) * radius;
    }

    camera.position.set(baseX, sy.get(), baseZ);
    camera.lookAt(new THREE.Vector3(stx.get(), sty.get(), stz.get()));
  });

  return null;
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/scene/CameraRig.tsx
git commit -m "Add CameraRig — spring-lerped camera with per-claim dolly and climax shot."
```

## Task 4.3: ClaimParticles

**Files:**
- Create: `components/board/scene/ClaimParticles.tsx`

Instanced spark pool with per-particle lifetime. Bursts on each claim at the cell world position.

- [ ] **Step 1: Create ClaimParticles.tsx**

Create `components/board/scene/ClaimParticles.tsx`:
```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CELL_GAP, CELL_SIZE, GRID } from "@/components/board/scene/BoardSurface";
import type { ClaimEvent } from "@/lib/board-timeline";
import type { PlayerId } from "@/content/types";

const PLAYER_COLOR_HEX: Record<PlayerId, string> = {
  a: "#5b9fd4",
  b: "#e07a5f",
};

const POOL_DESKTOP = 60;
const POOL_MOBILE = 24;
const PARTICLE_LIFETIME = 0.9; // seconds
const PARTICLE_SCALE = 0.025;

type Particle = {
  active: boolean;
  age: number;
  velocity: THREE.Vector3;
  spawnPos: THREE.Vector3;
  color: THREE.Color;
};

function cellWorldPos(index: number): THREE.Vector3 {
  const col = index % GRID;
  const row = Math.floor(index / GRID);
  const x = (col - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
  const z = (row - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
  return new THREE.Vector3(x, 0.6, z);
}

type ClaimParticlesProps = {
  lastClaim: ClaimEvent | null;
  reduced: boolean;
};

export function ClaimParticles({ lastClaim, reduced }: ClaimParticlesProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const poolSize = isMobile ? POOL_MOBILE : POOL_DESKTOP;
  const burstSize = isMobile ? 12 : 24;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<Particle[]>(
    Array.from({ length: poolSize }, () => ({
      active: false,
      age: 0,
      velocity: new THREE.Vector3(),
      spawnPos: new THREE.Vector3(),
      color: new THREE.Color(),
    })),
  );
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Spawn burst when a new claim event arrives.
  useEffect(() => {
    if (!lastClaim || reduced) return;
    const origin = cellWorldPos(lastClaim.index);
    const tint = new THREE.Color(PLAYER_COLOR_HEX[lastClaim.player]);
    let spawned = 0;
    for (let i = 0; i < particles.current.length && spawned < burstSize; i++) {
      const p = particles.current[i];
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.spawnPos.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.6 + Math.random() * 0.6;
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.cos(phi)) * speed * 0.7 + 0.4,
        Math.sin(phi) * Math.sin(theta) * speed,
      );
      p.color.copy(tint);
      spawned++;
    }
  }, [lastClaim, reduced, burstSize]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      if (!p.active) {
        // Hide unused instances by scaling to zero.
        matrix.makeScale(0, 0, 0);
        meshRef.current.setMatrixAt(i, matrix);
        continue;
      }
      p.age += delta;
      if (p.age >= PARTICLE_LIFETIME) {
        p.active = false;
        matrix.makeScale(0, 0, 0);
        meshRef.current.setMatrixAt(i, matrix);
        continue;
      }
      const lifeT = p.age / PARTICLE_LIFETIME;
      const x = p.spawnPos.x + p.velocity.x * p.age;
      const y = p.spawnPos.y + p.velocity.y * p.age - 0.5 * 1.6 * p.age * p.age;
      const z = p.spawnPos.z + p.velocity.z * p.age;
      const scale = PARTICLE_SCALE * (1 - lifeT * 0.6);

      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(x, y, z);
      meshRef.current.setMatrixAt(i, matrix);
      color.copy(p.color).multiplyScalar(1 - lifeT * 0.5);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, poolSize]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        emissive="#ffffff"
        emissiveIntensity={1.4}
        color="#ffffff"
        roughness={0.4}
      />
    </instancedMesh>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/scene/ClaimParticles.tsx
git commit -m "Add ClaimParticles — instanced spark pool keyed to claim events."
```

## Task 4.4: Wire CameraRig + ClaimParticles into BoardScene + add postprocessing

**Files:**
- Modify: `components/board/BoardScene.tsx`

- [ ] **Step 1: Replace BoardScene.tsx**

Replace the contents of `components/board/BoardScene.tsx`:
```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { BoardSurface } from "@/components/board/scene/BoardSurface";
import { CraftingTable } from "@/components/board/scene/CraftingTable";
import { CameraRig } from "@/components/board/scene/CameraRig";
import { ClaimParticles } from "@/components/board/scene/ClaimParticles";
import type { ClaimEvent } from "@/lib/board-timeline";
import type { PlayerId } from "@/content/types";

type BoardSceneProps = {
  active: boolean;
  owners: (PlayerId | null)[];
  latestIndex: number | null;
  lastClaim: ClaimEvent | null;
  isClimax: boolean;
  className?: string;
};

export function BoardScene({
  active,
  owners,
  latestIndex,
  lastClaim,
  isClimax,
  className,
}: BoardSceneProps) {
  const reduced = useReducedMotion();
  const isDesktop = typeof window === "undefined" || window.innerWidth >= 1024;
  const enablePost = !reduced && isDesktop;

  return (
    <div
      className={`${className ?? ""} relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.15),rgba(12,15,20,0.4)_65%)]`}
      aria-hidden
    >
      <Canvas
        camera={{ position: [2.4, 2, 2.6], fov: 40 }}
        dpr={[1, reduced ? 1 : isDesktop ? 2 : 1.5]}
        frameloop={active ? "always" : "demand"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[5, 8, 4]} intensity={1.65} castShadow />
        <directionalLight position={[-4, 3, -2]} intensity={0.55} />
        <pointLight position={[0, 2.5, 2]} intensity={1} color="#3dd68c" />

        <CraftingTable />
        <BoardSurface owners={owners} latestIndex={latestIndex} />
        <ClaimParticles lastClaim={lastClaim} reduced={reduced ?? false} />
        <CameraRig
          lastClaim={lastClaim}
          isClimax={isClimax}
          active={active}
          reduced={reduced ?? false}
        />

        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.55}
          scale={3.2}
          blur={2}
          far={1.4}
        />

        {enablePost && (
          <EffectComposer>
            <Bloom
              intensity={isClimax ? 1.4 : 0.25}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(isClimax ? 0.0025 : 0.0, isClimax ? 0.0025 : 0.0)}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors. (If `postprocessing` peer-dep complains, install it explicitly: `npm install postprocessing@latest`.)

- [ ] **Step 3: Commit**

```bash
git add components/board/BoardScene.tsx
git commit -m "Wire CameraRig + ClaimParticles + postprocessing into BoardScene."
```

---

# Phase 5 — HUD overlay

## Task 5.1: ScoreFlip — animated number digit

**Files:**
- Create: `components/board/hud/ScoreFlip.tsx`

Adapted from 21st.dev `AnimatedNumberFlip` (Framer `AnimatePresence` + rotateX), themed per player.

- [ ] **Step 1: Create ScoreFlip.tsx**

Create `components/board/hud/ScoreFlip.tsx`:
```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PlayerId } from "@/content/types";

type ScoreFlipProps = {
  player: PlayerId;
  value: number;
  target: number;
  isActive: boolean;
};

const PLAYER_LABEL: Record<PlayerId, string> = { a: "Player A", b: "Player B" };
const PLAYER_TEXT_CLASS: Record<PlayerId, string> = {
  a: "text-player-a",
  b: "text-player-b",
};

export function ScoreFlip({ player, value, target, isActive }: ScoreFlipProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`flex items-baseline gap-2 ${isActive ? "opacity-100" : "opacity-70"}`}>
      <span className={`text-xs font-semibold uppercase tracking-widest ${PLAYER_TEXT_CLASS[player]}`}>
        {PLAYER_LABEL[player]}
      </span>
      <div className="relative h-8 w-6 overflow-hidden font-mono text-2xl font-bold tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="absolute inset-0 flex items-center justify-center"
            initial={reduced ? { opacity: 0 } : { y: -32, opacity: 0, rotateX: -90 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, rotateX: 0 }}
            exit={reduced ? { opacity: 0 } : { y: 32, opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-mono text-sm text-muted">/ {target}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add components/board/hud/ScoreFlip.tsx
git commit -m "Add ScoreFlip — per-player animated number digit."
```

## Task 5.2: ClaimTicker — marquee feed

**Files:**
- Create: `components/board/hud/ClaimTicker.tsx`

Adapted from 21st.dev Marquee (Framer x-translate with vignettes). Replays last 6 claim events as scrolling chips.

- [ ] **Step 1: Create ClaimTicker.tsx**

Create `components/board/hud/ClaimTicker.tsx`:
```tsx
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
  // Pad history with neutral placeholders so the strip always reads as a feed.
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
      {/* Edge vignettes for the marquee. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add components/board/hud/ClaimTicker.tsx
git commit -m "Add ClaimTicker — marquee feed of recent claims with edge vignettes."
```

## Task 5.3: LockoutStamp — climax word stamp

**Files:**
- Create: `components/board/hud/LockoutStamp.tsx`

Adapted from 21st.dev `HighlightText` clip-path slide reveal. Fires once when timeline `isClimax === true`.

- [ ] **Step 1: Create LockoutStamp.tsx**

Create `components/board/hud/LockoutStamp.tsx`:
```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type LockoutStampProps = {
  visible: boolean;
};

export function LockoutStamp({ visible }: LockoutStampProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.4 }}
        >
          <motion.span
            className="rounded-md bg-emerald px-8 py-3 text-4xl font-extrabold tracking-[0.3em] text-surface shadow-[0_0_60px_rgba(61,214,140,0.6)] sm:text-6xl"
            initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)", scale: 1.05 }}
            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)", scale: 1 }}
            exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)", scale: 0.98 }}
            transition={{ duration: reduced ? 0.2 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            LOCKOUT
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add components/board/hud/LockoutStamp.tsx
git commit -m "Add LockoutStamp — clip-path slide reveal on climax."
```

## Task 5.4: BoardHud — overlay composition

**Files:**
- Create: `components/board/hud/BoardHud.tsx`

- [ ] **Step 1: Create BoardHud.tsx**

Create `components/board/hud/BoardHud.tsx`:
```tsx
"use client";

import sharedJson from "@/content/shared.json";
import type { SharedContent, PlayerId } from "@/content/types";
import { ClaimTicker } from "@/components/board/hud/ClaimTicker";
import { LockoutStamp } from "@/components/board/hud/LockoutStamp";
import { ScoreFlip } from "@/components/board/hud/ScoreFlip";
import type { ClaimEvent } from "@/lib/board-timeline";

const SHARED: SharedContent = sharedJson as SharedContent;

type BoardHudProps = {
  scores: Record<PlayerId, number>;
  activePlayer: PlayerId;
  history: ClaimEvent[];
  lastClaim: ClaimEvent | null;
  isClimax: boolean;
};

export function BoardHud({ scores, activePlayer, history, lastClaim, isClimax }: BoardHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top row: scores + win target */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <ScoreFlip player="a" value={scores.a} target={SHARED.winTarget} isActive={activePlayer === "a"} />
          <ScoreFlip player="b" value={scores.b} target={SHARED.winTarget} isActive={activePlayer === "b"} />
        </div>
        <div className="rounded-xl border border-border bg-surface-raised/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted backdrop-blur">
          First to <span className="font-bold text-emerald">{SHARED.winTarget}</span>
        </div>
      </div>

      {/* Bottom row: claim ticker — hidden on small screens for clutter control. */}
      <div className="hidden lg:block">
        <ClaimTicker history={history} lastClaim={lastClaim} />
      </div>

      <LockoutStamp visible={isClimax} />
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add components/board/hud/BoardHud.tsx
git commit -m "Add BoardHud — composes ScoreFlip, ClaimTicker, LockoutStamp."
```

---

# Phase 6 — Wire-up + cleanup

## Task 6.1: Rewrite BoardShowcase

**Files:**
- Modify: `components/board/BoardShowcase.tsx`

- [ ] **Step 1: Replace BoardShowcase.tsx**

Replace the contents of `components/board/BoardShowcase.tsx`:
```tsx
"use client";

import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BoardClaimProvider } from "@/lib/board-claim-context";
import { useBoardTimeline } from "@/lib/board-timeline";
import { BoardHud } from "@/components/board/hud/BoardHud";
import { BorderBeam } from "@/components/ui/BorderBeam";
import type { ClaimEvent } from "@/lib/board-timeline";

const BoardScene = dynamic(
  () => import("@/components/board/BoardScene").then((m) => m.BoardScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse rounded-2xl border border-emerald/20 bg-surface-raised"
        aria-hidden
      />
    ),
  },
);

const HISTORY_LIMIT = 6;

export function BoardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-80px", amount: 0.2 });
  const timeline = useBoardTimeline({ active: inView });
  const [history, setHistory] = useState<ClaimEvent[]>([]);

  // Maintain a rolling history of claim events for the ticker.
  useEffect(() => {
    if (!timeline.lastClaim) return;
    setHistory((prev) => [...prev, timeline.lastClaim!].slice(-HISTORY_LIMIT));
  }, [timeline.lastClaim]);

  // Reset history when the timeline resets (step goes from > 0 back to 0).
  const prevStep = useRef(timeline.step);
  useEffect(() => {
    if (prevStep.current > 0 && timeline.step === 0) {
      setHistory([]);
    }
    prevStep.current = timeline.step;
  }, [timeline.step]);

  const latestIndex = timeline.lastClaim?.index ?? null;

  return (
    <BoardClaimProvider>
      <motion.div
        ref={sectionRef}
        className="relative mx-auto h-[420px] w-full max-w-3xl overflow-hidden rounded-2xl sm:h-[480px] lg:h-[520px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <BoardScene
          active={inView}
          owners={timeline.owners}
          latestIndex={latestIndex}
          lastClaim={timeline.lastClaim}
          isClimax={timeline.isClimax}
          className="h-full w-full"
        />
        <BoardHud
          scores={timeline.scores}
          activePlayer={timeline.activePlayer}
          history={history}
          lastClaim={timeline.lastClaim}
          isClimax={timeline.isClimax}
        />
        <BorderBeam
          size={280}
          duration={14}
          borderWidth={1.5}
          colorFrom="var(--color-emerald)"
          colorTo="var(--color-amber)"
        />
      </motion.div>
    </BoardClaimProvider>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/board/BoardShowcase.tsx
git commit -m "Rewire BoardShowcase to BoardScene + BoardHud + BorderBeam."
```

## Task 6.2: Slim board section heading + remove obsolete BoardClaim integration

**Files:**
- Modify: `components/sections/Board.tsx`

The existing `Board.tsx` is mostly fine — it just renders SectionHeading + BoardShowcase. No edits needed unless the visual padding feels off after the canvas reshape. Verify the section reads clean.

- [ ] **Step 1: Inspect**

Open `components/sections/Board.tsx`. Confirm it still imports BoardShowcase and renders inside a section with `id="board"`. No changes required.

- [ ] **Step 2: Visual confirm**

Open http://localhost:3000#board. The section should show the heading + the new canvas-with-HUD + BorderBeam. Whole loop should play through to LOCKOUT every ~14 seconds.

If padding looks off (e.g., heading too far from canvas), tighten `mb-12` on SectionHeading or `max-w-5xl` on the wrapper. Commit any layout tweak as a separate commit.

## Task 6.3: Delete obsolete board components and trim board-demo

**Files:**
- Delete: `components/board/BoardCanvas.tsx`, `components/board/CraftingTableModel.tsx`, `components/board/BingoGrid.tsx`, `components/board/BoardCell.tsx`, `components/board/BoardProgress.tsx`
- Modify: `lib/board-demo.ts`

- [ ] **Step 1: Verify deletions are safe**

Run a grep to confirm no remaining imports reference the doomed files:
```bash
grep -rn --include='*.tsx' --include='*.ts' \
  -e "from \"@/components/board/BoardCanvas\"" \
  -e "from \"@/components/board/CraftingTableModel\"" \
  -e "from \"@/components/board/BingoGrid\"" \
  -e "from \"@/components/board/BoardCell\"" \
  -e "from \"@/components/board/BoardProgress\"" \
  components/ lib/ app/
```
Expected: zero matches. If any match exists, do not delete that file yet — find the importer and update it first.

- [ ] **Step 2: Delete the files**

```bash
git rm components/board/BoardCanvas.tsx \
       components/board/CraftingTableModel.tsx \
       components/board/BingoGrid.tsx \
       components/board/BoardCell.tsx \
       components/board/BoardProgress.tsx
```

- [ ] **Step 3: Trim lib/board-demo.ts**

Replace `lib/board-demo.ts` with types-only (the rest moved to JSON):
```ts
export type PlayerId = "a" | "b";

export type BoardGoal = {
  id: number;
  label: string;
};

/**
 * BOARD_GOALS and DEMO_CLAIMS moved to content/board/goals.json and
 * content/board/demo-script.json respectively. Read via lib/board-timeline.ts
 * or import directly from the content folder.
 *
 * WIN_TARGET moved to content/shared.json (`winTarget`).
 */
```

Or — simplest — delete `lib/board-demo.ts` entirely if nothing imports it. Check:
```bash
grep -rn --include='*.tsx' --include='*.ts' "from \"@/lib/board-demo\"" components/ lib/ app/
```
If zero matches, run `git rm lib/board-demo.ts`. If any matches remain, prefer keeping the types-only shim above so existing consumers compile.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx next lint --quiet
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove obsolete board components and trim board-demo to types."
```

## Task 6.4: Final verification

- [ ] **Step 1: Type-check + lint clean**

```bash
npx tsc --noEmit && npx next lint --quiet
```
Expected: both pass.

- [ ] **Step 2: Dev smoke**

Open http://localhost:3000 in a browser:
- Section "The board" loads inside ~1s.
- Canvas shows the crafting table with 25 visible Faithful-style icons on the top surface.
- Loop plays: claims land every ~900ms, cells light up player-a (blue) or player-b (red), small camera dolly per claim.
- Score digits flip; ticker scrolls on desktop.
- 13th claim triggers low-angle camera + bloom + LOCKOUT word stamp.
- After ~2.8s, loop resets and replays.
- BorderBeam glow visibly travels around the canvas frame.

- [ ] **Step 3: Mobile smoke (devtools responsive mode)**

Set viewport width to 375px:
- Canvas height ~280px, ticker hidden, score visible at top.
- No camera dolly (just auto-orbit).
- Bloom + chromatic disabled (no postprocessing effects on the climax).
- LOCKOUT stamp still fires.

- [ ] **Step 4: Reduced-motion smoke**

In browser devtools, Rendering panel → "Emulate CSS prefers-reduced-motion: reduce":
- Reload, scroll to Board.
- Cells fill in instantly to the step-8 snapshot (no animation).
- No camera orbit, no particles.
- Ticker shows a single static badge, not scrolling.
- LOCKOUT fades in only via opacity (no clip-path slide).

- [ ] **Step 5: Production build**

```bash
npx next build
```
Expected: build succeeds; no type or lint errors.

- [ ] **Step 6: Lighthouse perf check**

In Chrome devtools → Lighthouse → Performance, mobile preset:
- Run on http://localhost:3000 (or `npx next start` after build).
- Note the Performance score. Acceptance: within 5 points of the pre-revamp baseline. If it dropped more than 5, profile via the Performance panel — likely culprits: postprocessing on too-low devices, atlas decode timing, instanced particle pool size.

- [ ] **Step 7: Final commit (if any tweaks landed during verification)**

```bash
git status
# If only test/cleanup tweaks remain:
git add -A && git commit -m "Final verification polish for Board cinematic trailer."
```

---

## Self-review checklist (run before handing off)

### Spec coverage

Walk through each `§` in `docs/plans/2026-05-16-board-revamp-design.md`:
- §1 Architecture & layout → Tasks 3.6, 4.4, 6.1
- §2 Components & 21st.dev wiring → Tasks 2.1 (BorderBeam), 5.1 (ScoreFlip), 5.2 (ClaimTicker), 5.3 (LockoutStamp), 6.1 (composition)
- §3 Data flow → Task 4.1 (useBoardTimeline), 6.1 (subscription wiring)
- §4 Camera & motion choreography → Tasks 4.2 (CameraRig), 4.3 (ClaimParticles), 4.4 (postprocessing climax)
- §4½ Content authoring → Tasks 1.1–1.6 (types, goals, demo-script, hero, shared, Hero refactor), 1.7 (icons), 1.8 (footer credit)
- §5 Mobile + reduced motion → handled inside CameraRig (4.2), ClaimParticles (4.3), BoardScene (4.4), ClaimTicker (5.2), LockoutStamp (5.3), BoardHud (5.4)
- §6 Risks & open items → atlas (3.2), nearest filter (3.2/3.5), instanced pool (4.3), conditional postprocessing (4.4), CSS-keyframes exception documented in globals.css (2.1)
- §7 Definition of done → Task 6.4 verification steps

No spec items unmapped.

### Placeholder scan

- No "TBD", "TODO", or "implement later" anywhere in the plan.
- Every code-step shows complete code, not pseudocode or signatures.
- File paths are exact and absolute from the repo root.

### Type consistency

- `ClaimEvent` (lib/board-timeline.ts) shape `{ index, slug, player, tick }` matches all consumers (CameraRig, ClaimParticles, ClaimTicker, BoardHud, BoardShowcase).
- `PlayerId` (content/types.ts) `"a" | "b"` matches across all components.
- `Goal` (content/types.ts) `{ slug, label, icon, tier }` matches the JSON exactly.
- `loadBoardIconAtlas` returns `IconAtlas { texture, uvBySlug, uvByIndex }` and that's the same shape consumed in BoardSurface (`atlas.uvBySlug[goal.slug]`).
- `BoardSurface` re-exports `CELL_SIZE`, `CELL_GAP`, `GRID`, `SURFACE_WIDTH`; CameraRig and ClaimParticles both import the first three from `@/components/board/scene/BoardSurface` (same path).

No type mismatches.

---

## Execution handoff

Plan complete and saved to `docs/plans/2026-05-16-board-revamp-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best fit for this plan because each task produces a self-contained commit.

**2. Inline Execution** — I execute tasks in this session using executing-plans, batched with checkpoints for review.

Which approach?
