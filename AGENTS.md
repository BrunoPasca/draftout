# Draftout — Agent Guide

Marketing landing page for **Draftout** — a **free**, competitive **Minecraft 1v1 game mode** that mixes speedrunning with a bingo-style challenge board. Prioritize fast loads, strong SEO, and polished motion. No pricing on v1.

## Product (source of truth)

**One-liner:** Turn-based draft to build a 25-goal board, then race in identical survival worlds to complete **13 goals first** — each goal locks for the opponent once claimed.

| Phase | What happens |
|-------|----------------|
| **The Draft** | Players alternate picking between two proposed goals until the 25-goal bingo board is set — favor strengths, deny the opponent. |
| **The Race** | Both drop into identical single-player worlds (same seed, same RNG). |
| **The Lockout** | First to complete any **13** of the 25 goals wins; a completed goal is **exclusively** theirs — the other cannot claim it. |

**Competitive layer:** Ranked **Elo** leaderboard; popular with competitive speedrunners and content creators.

## v1 page sections (recommended order)

1. **Hero** — Hook + 1v1 / speedrun × bingo positioning + primary CTA (“Play free”, “Get the mod”, etc.)
2. **How it works** — **Draft → Race → Lockout** (three cards; core explainer — do not bury this)
3. **The board** — Hero-quality interactive UI (see below); primary “show don’t tell” section
4. **Competitive** — Elo, ranked ladder, speedrunner/creator audience (not a generic “features” grid)
5. **Social proof** — Creators, community quotes, or player counts if available
6. **FAQ** — Minecraft version, install, multiplayer setup, ranked vs casual
7. **Footer CTA** — Repeat primary action

**Do not use** a SaaS-style “Problem” section or pricing. The story is mechanics-first, then competition, then trust.

### The Board — UI direction (v1 showcase)

Treat this section as a **mini product demo**, not a static screenshot.

- **25-cell bingo grid** (5×5) with readable goal labels or icons; visually distinct from generic feature cards.
- **Progress toward 13**: e.g. counter or progress ring (“7 / 13”) tied to demo state.
- **Lockout in action**: when a cell is “completed,” animate claim (player color) and locked/disabled state for the opponent — Framer Motion for cell flip, scale, or overlay.
- **Optional micro-interactions**: hover a cell for goal tooltip; tap/hover “simulate pick” during draft phase (two choices) if scope allows.
- **Pair identity**: subtle Player A / Player B (or team colors) so lockout reads instantly.
- Keep it **accessible**: keyboard-focusable cells, `useReducedMotion()` simplifies to instant state changes.
- Prefer CSS grid for layout; **all motion via Framer Motion** on cells and progress UI.

## Stack (target)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15** (App Router) | SSG/SSR for SEO, image optimization, simple deploy |
| UI | **React 19** + **TypeScript** | Type-safe components |
| Styling | **Tailwind CSS v4** | Rapid layout and responsive design |
| Animation | **Framer Motion** | All motion — see below |
| Runtime | **Node 22** via Docker | Consistent dev and production |

## Project layout (once scaffolded)

```
app/              # Routes and page sections
components/       # Reusable UI (motion wrappers live here)
lib/              # Shared utilities (e.g. motion variants)
public/           # Static assets
```

## Animation (Framer Motion)

Use **Framer Motion for all animations**. Do not use CSS `@keyframes`, `transition` on layout reveals, or other animation libraries for UI motion.

- **Scroll-triggered fades**: `motion` + `whileInView` with `viewport={{ once: true, margin: "-80px" }}` and `initial` / `animate` opacity + y offset.
- **Staggered reveals**: Parent `motion` with `variants` + `staggerChildren` / `delayChildren`; children use variant names (`hidden` → `visible`).
- **Hover transitions**: `whileHover` / `whileTap` on buttons, cards, and links — keep durations ~0.2–0.35s, ease `[0.22, 1, 0.36, 1]`.
- **Reduced motion**: Respect `useReducedMotion()` — skip or simplify non-essential motion when enabled.
- Prefer `motion` components over imperative `animate()` unless sequencing complex timelines.

## Conventions

- Functional components only; colocate section-specific code under `components/sections/`.
- One primary CTA per viewport (e.g. “Get started”, “Download free”); no pricing section on v1.
- Semantic HTML (`header`, `main`, `section`, `footer`).
- Images via `next/image` with explicit `width` / `height` or `fill`.
- No client-side data fetching unless required — landing is mostly static.

## Commands

```bash
npm run dev          # Local dev (port 3000)
docker compose up    # Dev in Docker with hot reload
npm run build        # Production build
```

## Docker

- **Development**: `docker compose up` — uses `dev` target, mounts source, preserves `node_modules` volume.
- **Production**: build with `docker build --target runner` after `output: 'standalone'` is set in `next.config`.
