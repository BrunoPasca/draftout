# Board Revamp — Cinematic Trailer Design

**Date:** 2026-05-16
**Status:** Approved
**Supersedes (in part):** `docs/plans/2026-05-16-board-3d-design.md` (the crafting-table centerpiece stays; the 2D BingoGrid overlay is replaced)
**Rollback:** `git revert` the implementation commits; the centerpiece checkpoint at `e49bbe2` remains a valid intermediate state.

## Goal

Turn **The Board** from a 2D grid + 3D centerpiece (current state) into a single **cinematic mini-trailer**: a ~12s scripted loop on the page where the 25-cell board lives **on** the crafting table in 3D, a camera dollies through the claims, and the 13th claim triggers a signature beat with bloom + screen-wide "LOCKOUT" stamp.

Wow factor framing settled with the user:
- **Flavour:** cinematic mini-trailer (passive viewing, authored climax)
- **Surface:** 3D-native spectacle (camera moves, particles in scene, bloom on 13th)
- **Grid placement:** pure 3D on the crafting-table top — no 2D HTML grid overlay
- **Cell content:** pictogram-only pixel-art Minecraft icons, goal name surfaces in HUD ticker
- **Icons:** CC-licensed Faithful resource pack (CC-BY-4.0), credited in footer

## §1 — Architecture & file layout

Two synchronized layers, one timeline source.

### Layer 1 — 3D scene (R3F)
- One `Canvas`, camera rig, table base, 25 emissive cell planes on the top surface, particle pool, optional bloom postprocessing.

### Layer 2 — HUD overlay (DOM)
- Score, claim ticker, lockout stamp, BorderBeam frame, CTA. Plain Framer-Motion-driven HTML on top of the canvas via z-stacking.

### File layout

```
components/sections/Board.tsx                   # section wrapper + SectionHeading + canvas frame
components/board/BoardShowcase.tsx              # composition: scene + HUD, owns the timeline hook
components/board/BoardScene.tsx                 # NEW — R3F Canvas wrapper (replaces BoardCanvas)
components/board/scene/
  CraftingTable.tsx                             # NEW — rebuilt table (no top mesh; the board is the top)
  BoardSurface.tsx                              # NEW — the 5×5 emissive cell grid
  BoardCell3D.tsx                               # NEW — one textured cell plane, claim-aware
  ClaimParticles.tsx                            # NEW — instanced spark burst pool
  CameraRig.tsx                                 # NEW — camera target spring keyed by demo step
components/board/hud/
  BoardHud.tsx                                  # NEW — HUD container
  ScoreFlip.tsx                                 # NEW — number flip (21st AnimatedNumberFlip)
  ClaimTicker.tsx                               # NEW — marquee feed (21st Marquee)
  LockoutStamp.tsx                              # NEW — clip-path slide (21st HighlightText)
components/ui/BorderBeam.tsx                    # NEW — 21st Magic UI BorderBeam, themed
lib/board-icons.ts                              # NEW — loads PNGs into a single THREE atlas
lib/board-timeline.ts                           # NEW — useBoardTimeline() hook (12s scripted loop)

content/board/
  goals.json                                    # NEW — 25 goals as data
  demo-script.json                              # NEW — claim order timeline
content/hero.json                               # NEW — Hero eyebrow + headline + CTA copy (refactor)
content/faq.json                                # NEW — FAQ items (refactor pending)
content/shared.json                             # NEW — brand strings, footer, attribution

public/board/icons/                             # NEW — 25 Faithful PNGs, keyed by slug
public/board/CREDITS.md                         # NEW — Faithful attribution
```

### Files removed in the implementation commit

- `components/board/BoardCanvas.tsx` → replaced by `BoardScene.tsx`
- `components/board/CraftingTableModel.tsx` → replaced by `scene/CraftingTable.tsx` + `scene/BoardSurface.tsx`
- `components/board/BingoGrid.tsx` → role split between `scene/BoardSurface.tsx` (visual) and `hud/BoardHud.tsx` (labels)
- `components/board/BoardCell.tsx` → replaced by `scene/BoardCell3D.tsx`
- `components/board/BoardProgress.tsx` → replaced by `hud/ScoreFlip.tsx` + `hud/ClaimTicker.tsx`

`lib/board-demo.ts` is split: types stay (`PlayerId`, `BoardGoal`), `BOARD_GOALS` + `DEMO_CLAIMS` move to JSON.

## §2 — Components & 21st.dev wiring

| Layer | Component | 21st.dev source | Adaptation |
|---|---|---|---|
| Canvas frame | `BorderBeam` | **Magic UI Border Beam** (`offset-path: rect()` + animated `offset-distance`) | `colorFrom=var(--color-emerald)`, `colorTo=var(--color-amber)`, `duration=14s`, rounded-2xl inheritable |
| Score digits | `ScoreFlip` | **AnimatedNumberFlip** (Framer `AnimatePresence` + rotateX) | Two instances (`text-player-a` / `text-player-b`); spring keyed by score change |
| Claim ticker | `ClaimTicker` | **Marquee** (Framer x-translate with vignettes) | Drives off last 6 claims; chip = `▓ Player A · Diamond`; pauses on hover |
| LOCKOUT stamp | `LockoutStamp` | **HighlightText** (Framer `clipPath: inset()` slide) | Fires once per loop on `step === 13`; emerald bg, surface text, 480ms slide-in / 1.4s hold / 320ms slide-out |
| 3D scene | `BoardScene` | — (R3F, no 21st) | Camera rig, table, board surface, particles |
| Cell sprites | `BoardCell3D` | — | 25 plane meshes on the table top; share one `MeshStandardMaterial` with per-instance UV offsets pointing at the atlas |
| CTA below | reuse `ShimmerButton` | (already shipped from Hero work) | "Get the mod" / "Play free" |

Reused from the Hero phase already shipped: `ShimmerButton`, `BlurFade`, `DottedSurface`, `TextScramble`. No duplication.

## §3 — Data flow

```
content/board/goals.json + content/board/demo-script.json
        │  (compiled into bundle at build time)
        ▼
useBoardTimeline()        ← single 12s scripted loop driver, lives in lib/board-timeline.ts
        │
        ▼
BoardClaimProvider (existing)
        │
        ├─→ BoardScene (R3F)
        │       ├─ CameraRig         reads lastClaim, springs camera target → claimed cell
        │       ├─ BoardSurface      mutates cell emissive on claim
        │       └─ ClaimParticles    spawns burst at the cell world-position
        │
        └─→ BoardHud (DOM)
                ├─ ScoreFlip         reads scores derived from owners[]
                ├─ ClaimTicker       reads last N claim events from a small history stack
                └─ LockoutStamp      fires when step === 13
```

After step 13 + 2.8s hold, timeline resets to initial state. `inView` from `useInView` pauses/resumes the timeline and the R3F `frameloop` together.

## §4 — Camera & motion choreography

**Loop beats (12s end-to-end, +2s outro hold, then reset)**

| t (s) | Event | Camera | 3D scene | HUD |
|---|---|---|---|---|
| 0.0 | Idle | wide auto-orbit (0.35 rad/s) | table breathing emissive | ticker scrolling, score 0/0 |
| 0.9 | Claim 1 (A) | dolly 0.4u toward cell, 320ms ease | particle burst, cell washes player-a colour | score flip to 1, ticker prepends |
| 1.8 | Claim 2 (B) | dolly to opposite quadrant | same, player-b | … |
| 2.7 → 11.7 | Claims 3–12 every 900ms | small per-claim parallax | per-cell emissive flash + sparks | running ticker + score flips |
| 11.7 | **Claim 13 — climax** | drop to low angle (1.2u high, 30° pitch), 320ms ease | bloom 0→1, chromatic 0→3, sparks ×3 | LockoutStamp slides in |
| 12.5 | Hold | static low angle | sustained bloom | stamp held |
| 13.4 | Outro | pull back to wide, 700ms ease | bloom decays | stamp slides out, ticker fades |
| 14.0 | Reset | snap to idle | clear all cells | scores zero, ticker reseeds |

All motion via **Framer Motion only** (camera target is a `useSpring` value consumed inside `useFrame` to lerp the THREE camera each frame). No CSS keyframes, no GSAP.

## §4½ — Content authoring (the editable surface)

**Principle:** every piece of editable text or imagery moves out of TS components into `/content/*.json` + `/public/**`. A non-dev (or an AI assistant) can edit copy and asset references without touching component code.

### `content/board/goals.json` — the 25 goals

```jsonc
[
  {
    "slug": "stone-pick",
    "label": "Stone pickaxe",
    "icon": "stone-pick",          // resolves to /public/board/icons/stone-pick.png
    "tier": "early"                // early | mid | late
  },
  {
    "slug": "iron-ingot",
    "label": "Iron ingot",
    "icon": "iron-ingot",
    "tier": "early"
  }
  // ... 23 more, indexed 0..24 by array position
]
```

### `content/board/demo-script.json` — the 13-claim demo timeline

```jsonc
[
  { "cell": "stone-pick",    "player": "a" },
  { "cell": "zombie-kill",   "player": "b" },
  { "cell": "diamond",       "player": "a" },
  // ... 10 more
]
```

The script references cells by `slug`, not by index — easier to edit when goals are reordered. `lib/board-timeline.ts` resolves slugs to indices on load.

### `content/hero.json` — Hero section copy (refactor existing Hero in same PR)

```jsonc
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

### `content/shared.json` — cross-cutting strings

```jsonc
{
  "brand": "Draftout",
  "winTarget": 13,
  "cellCount": 25,
  "footerAttribution": "Goal icons adapted from Faithful (CC-BY-4.0)"
}
```

### Types

A single `content/types.ts` defines `Goal`, `DemoClaim`, `HeroContent`, etc. JSON imports are validated against these types via TypeScript's `resolveJsonModule` + explicit type imports:

```ts
import goalsJson from "@/content/board/goals.json";
import type { Goal } from "@/content/types";

export const GOALS: Goal[] = goalsJson;
```

Build-time validation lives in `lib/content-validation.ts` (called from a small `scripts/validate-content.ts` you can run pre-commit or in CI — out of scope for this design, but the entry point is open).

### Icon assets

`/public/board/icons/{slug}.png` — 16×16 PNGs from Faithful, one per goal slug. Filename = `icon` field in `goals.json`. Adding a new goal:

1. Add an entry to `goals.json` with a new `slug` + `icon`.
2. Drop `{icon}.png` into `/public/board/icons/`.
3. (Optional) Reference the slug in `demo-script.json` if you want it claimed in the demo.

No code edits required for content changes.

### i18n upgrade path (deferred — not v1)

When a second language ships:
- Wrap each `content/*.json` with `{ "en": {...}, "es": {...} }` OR split into `content/{locale}/*.json`.
- Adopt `next-intl` with locale routing.
- Components stay the same shape; only the loader changes.

YAGNI for v1 — single language, single namespace.

## §5 — Mobile & reduced motion

**Mobile (`<lg` breakpoint, `~1024px`)**
- Same R3F scene, `dpr={[1, 1.5]}`, no camera dolly (auto-orbit only, slowed to 0.2 rad/s)
- HUD reflows below canvas: `score | progress dots`; ticker hidden (visual clutter at narrow widths)
- LockoutStamp still fires
- Canvas height: 280px (vs 480 desktop)
- Bloom + chromatic disabled (perf budget)

**`prefers-reduced-motion`**
- Canvas: locked wide camera, no orbit, no particles
- Cells light up instantly on claim — no transitions, no spring
- Ticker: static last-claim badge instead of scrolling
- LockoutStamp: opacity fade at step 13 only (no clip-path slide, no scale)
- Loop still runs (the *state* progression is core to the demo); only the motion is suppressed

**`!inView`**
- R3F `frameloop="demand"` — table renders once and freezes
- `useBoardTimeline` pauses; resumes from current step when back in view

## §6 — Risks & open items

| Risk | Mitigation |
|---|---|
| Pixel-art on 3D planes blurs under camera dolly | `THREE.NearestFilter` + atlas + cells stay close to camera; reads pixel-perfect |
| 25 separate textures = draw call overhead | Build one 80×80 atlas (5×5 of 16×16) at boot, all cells share one material via UV offsets |
| Particle systems hurt mobile FPS | Cap instances to 24 per burst on mobile, 60 desktop; reuse pool, recycle on completion |
| Bloom / chromatic adds R3F postprocessing dep | `@react-three/postprocessing` (~30kb gz); only enable on desktop + claim 13 |
| BorderBeam uses CSS `offset-path` — older Safari? | Modern Safari 16.4+ supports it; static emerald border as fallback via `@supports` |
| Faithful pack file size | 25 PNGs at ~200 bytes each ≈ 5kb total. Negligible. |
| JSON imports lose type narrowing | Mitigated via `content/types.ts` + explicit `Goal[]` cast at import sites |
| Old Board components live in repo during transition | Ship new components in same commit that switches `Board.tsx` over; old files deleted atomically |

## §7 — Definition of done

- [ ] 25 cells render on the table top with correct icons sourced from `content/board/goals.json` + `/public/board/icons/`
- [ ] 12s scripted loop plays end-to-end: camera moves, particle bursts, score flips, ticker scrolls
- [ ] Step-13 climax triggers LOCKOUT stamp + bloom + low camera
- [ ] Mobile: canvas height ~280px, no jank, score visible, ticker hidden, climax still fires
- [ ] `prefers-reduced-motion`: complete state at step 13, no looping motion, all text readable
- [ ] `!inView`: timeline + frameloop both pause; resume on re-enter
- [ ] Footer credits Faithful + author + license link
- [ ] Editing a goal in `goals.json` + dropping a new PNG = visible change without touching component code
- [ ] Lighthouse perf score doesn't drop more than 5 points vs current Board

## §8 — Out of scope (v1)

- next-intl / multi-language (deferred until 2nd locale exists)
- User-interactive board (clickable cells, sandbox mode)
- Audio (claim thunk, lockout chime) — design considered, deferred
- Per-cell hover-preview floating cards
- A live-play / multiplayer preview tied to a real Draftout server
- Custom display font (e.g., "Press Start 2P") for HUD numbers
- CI content-validation hook (the loader will throw on malformed JSON at boot — sufficient for v1)
