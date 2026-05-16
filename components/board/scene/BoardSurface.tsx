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
const CELL_GAP = 0.07;
const SURFACE_WIDTH = 1.42;      // sits on top of the 1.5-wide cube with ~0.04 margin all around
const CELL_SIZE = (SURFACE_WIDTH - CELL_GAP * (GRID - 1)) / GRID;

export function BoardSurface({ owners, latestIndex, surfaceY = 0.77 }: BoardSurfaceProps) {
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
