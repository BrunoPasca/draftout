"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { CELL_GAP, CELL_SIZE, GRID } from "@/components/board/scene/BoardSurface";
import type { ClaimEvent } from "@/lib/board-timeline";

const WIDE_POS: [number, number, number] = [2.6, 2.2, 2.8];
const WIDE_TARGET: [number, number, number] = [0, 0.15, 0];
const CLIMAX_POS: [number, number, number] = [0.0, 1.4, 2.2];
const CLIMAX_TARGET: [number, number, number] = [0, 0.3, 0];

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
  return [x, 0.53, z];
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
    camera.lookAt(stx.get(), sty.get(), stz.get());
  });

  return null;
}
