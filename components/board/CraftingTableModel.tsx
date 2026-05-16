"use client";

import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useBoardClaim } from "@/lib/board-claim-context";

function usePlankTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#6b4f2a";
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "#8b6914";
    for (let y = 0; y < 64; y += 8) {
      ctx.fillRect(0, y, 64, 6);
    }
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
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);
}

function useGridTopTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#9c7b4f";
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = "#5a3d1e";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 64; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 64);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(64, i);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }, []);
}

type CraftingTableModelProps = {
  paused: boolean;
};

export function CraftingTableModel({ paused }: CraftingTableModelProps) {
  const group = useRef<THREE.Group>(null);
  const topMat = useRef<THREE.MeshStandardMaterial>(null);
  const plankTex = usePlankTexture();
  const gridTex = useGridTopTexture();
  const reduced = useReducedMotion();
  const { lastClaim } = useBoardClaim();
  const pulseRef = useRef(0);

  useEffect(() => {
    if (lastClaim) pulseRef.current = 1;
  }, [lastClaim]);

  useFrame((_, delta) => {
    if (!group.current || paused) return;

    if (!reduced) {
      group.current.rotation.y += delta * 0.35;
    }

    if (pulseRef.current > 0 && topMat.current) {
      pulseRef.current = Math.max(0, pulseRef.current - delta * 2.5);
      const t = pulseRef.current;
      topMat.current.emissive.setHex(0x3dd68c);
      topMat.current.emissiveIntensity = t * 0.85;
    } else if (topMat.current) {
      topMat.current.emissiveIntensity = 0;
    }
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.45, 1.1]} />
        <meshStandardMaterial map={plankTex} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[1.2, 0.12, 1.2]} />
        <meshStandardMaterial
          ref={topMat}
          map={gridTex}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
