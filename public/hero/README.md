# Hero images

The scroll-expand hero (`components/sections/Hero.tsx` → `components/ui/scroll-expansion-hero.tsx`) reads two images from this directory:

| File | Used as | Recommended dimensions | Notes |
|---|---|---|---|
| `bg.jpg` | Full-viewport background (atmospheric, blurs out as you scroll) | **1920×1080** or larger, landscape | Rendered via `next/image` with `object-fit: cover`. Will be lightly darkened (`bg-black/10` overlay). |
| `media.jpg` | Expanding tile (300×400 → ~1550×800 as user scrolls) | **1280×800** or larger, landscape-ish | Rendered with `object-cover` inside a rounded tile with a `bg-black/50` overlay that fades on scroll. |

## How to swap in your own images

1. Drop a new file at `public/hero/bg.jpg` (or `.png` / `.webp`) — Next.js's image pipeline accepts any common format under `public/`.
2. Drop a new file at `public/hero/media.jpg`.
3. Save; the dev server hot-reloads. No code changes needed if you keep the same filenames.

If you want to use a **different filename** (e.g. `gameplay-screenshot.png`), update `content/hero.json`'s `bgImage` and `media` fields to the new path (e.g. `/hero/gameplay-screenshot.png`).

## What's in here now (placeholders)

Both files are temporary placeholders sourced from Unsplash via curl during development:

- `bg.jpg` — 1920×1440 — atmospheric Unsplash photo (id `1614680376573-df3480f0c6ff`)
- `media.jpg` — 1280×853 — Minecraft pickaxe by Iván Díaz on Unsplash (id `1493711662062-fa541adb3fc8`)

Replace them with real Draftout assets (gameplay screenshots, branded renders, etc.) when you have them.

## Remote URLs

If you'd prefer to point at a remote URL (Cloudinary, S3, Unsplash hot-link, etc.) instead of a local file:

1. Add the domain to `next.config.ts`:
   ```ts
   images: {
     remotePatterns: [{ protocol: "https", hostname: "your-cdn.com" }],
   }
   ```
2. Set the full URL in `content/hero.json`'s `bgImage` or `media`.
