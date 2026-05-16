"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { ClaimEvent } from "@/lib/board-timeline";

const WIDE_POS: [number, number, number] = [3.2, 2.6, 3.4];
const CLIMAX_POS: [number, number, number] = [0.0, 1.9, 2.9];
const CLIMAX_TARGET_Y = 0.5;

type CameraRigProps = {
  lastClaim: ClaimEvent | null;
  isClimax: boolean;
  active: boolean;
  reduced: boolean;
};

/**
 * Drives the camera position only during the climax shot — drops to a low-hero
 * angle when isClimax flips true. OrbitControls handles all idle motion + user
 * interaction otherwise; this rig overrides for the cinematic beat.
 */
export function CameraRig({ isClimax, active, reduced }: CameraRigProps) {
  const { camera } = useThree();
  const climaxRef = useRef(0); // 0 → wide, 1 → climax

  useFrame((_, delta) => {
    if (!active || reduced) return;

    // Smoothly tween between 0 and 1 based on isClimax
    const target = isClimax ? 1 : 0;
    climaxRef.current += (target - climaxRef.current) * Math.min(1, delta * 1.6);

    if (climaxRef.current < 0.01) return; // Let OrbitControls drive when idle

    const t = climaxRef.current;
    const px = WIDE_POS[0] * (1 - t) + CLIMAX_POS[0] * t;
    const py = WIDE_POS[1] * (1 - t) + CLIMAX_POS[1] * t;
    const pz = WIDE_POS[2] * (1 - t) + CLIMAX_POS[2] * t;
    camera.position.set(px, py, pz);
    camera.lookAt(0, CLIMAX_TARGET_Y * t + 0.4 * (1 - t), 0);
  });

  return null;
}
