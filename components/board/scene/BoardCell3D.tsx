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
