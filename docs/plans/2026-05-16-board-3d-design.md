# Board 3D Centerpiece — Design

**Date:** 2026-05-16  
**Status:** Approved  
**Rollback:** `git reset --hard 0d9f692` (pre-3D checkpoint)

## Goal

Upgrade **The Board** section with a **3D crafting table centerpiece** (React Three Fiber) that stays **visible on mobile**, while keeping the existing **5×5 lockout bingo grid** as the interactive source of truth.

## Layout

### Desktop (lg+)

- Section title + copy unchanged.
- Center: R3F canvas with stylized crafting table (procedural materials v1).
- Grid wraps or flanks the table; progress bars below.
- Table: slow auto-rotate, no user orbit required.

### Mobile

- **Stack:** 3D table on top (~160–200px canvas) → full-width 5×5 grid → progress.
- Table always visible (no static-image fallback).
- Reduced `dpr`, pause rendering when off-screen.

## Behavior

| Event | Grid (Framer Motion) | Table (R3F) |
|-------|----------------------|-------------|
| Demo claims goal | Cell claim + lock colors | Brief emissive pulse (emerald) |
| Reduced motion | Instant state changes | Static pose, no rotation |
| Off-screen | — | Pause WebGL loop |

## Tech

- **@react-three/fiber** + **@react-three/drei**
- Dynamic import (`next/dynamic`, `ssr: false`) for canvas
- Procedural wood + grid-top materials (no Mojang textures)
- Optional later: `public/models/crafting-table/table.glb` + custom PNG faces

## Out of scope (v1)

- 21st.dev components for the table
- Full Minecraft asset fidelity
- User-controlled 3D camera on mobile

## Logo

Gemini v1 rejected. Use prompt v2 in plan notes or text logotype until a clean mark exists. Assets: `public/brand/logo.png` when ready.

## Files (planned)

```
components/board/CraftingTableScene.tsx
components/board/BoardScene.tsx      # Canvas wrapper
components/sections/Board.tsx        # layout update
lib/board-demo.ts                  # optional claim callback
```
