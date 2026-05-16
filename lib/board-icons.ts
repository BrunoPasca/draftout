"use client";

import * as THREE from "three";
import goalsJson from "@/content/board/goals.json";
import type { Goal } from "@/content/types";

const GOALS: Goal[] = goalsJson as Goal[];

export const ATLAS_GRID = 5;          // 5×5 atlas matches 5×5 board
export const TILE_PX = 16;            // each tile is 16×16 source px
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

/** Build (or return) the singleton atlas. SSR-safe: rejects on the server. */
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

    const uvBySlug: Record<string, AtlasUv> = {};
    const uvByIndex: AtlasUv[] = [];

    await Promise.all(
      GOALS.map((goal, index) => {
        const col = index % ATLAS_GRID;
        const row = Math.floor(index / ATLAS_GRID);
        return loadImage(`/board/icons/${goal.icon}.png`).then((img) => {
          // Source images may be 16×16 or 32×32 (Faithful 32x). Either way,
          // draw into a 16×16 cell — the browser downsamples with nearest neighbour
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
  })().catch((err) => {
    // Allow a future caller to retry instead of permanently caching the rejection.
    _atlasPromise = null;
    throw err;
  });

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
