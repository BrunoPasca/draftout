"use client";

import { useMemo } from "react";
import * as THREE from "three";

function buildPlankTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("plank texture: 2d ctx unavailable");
  ctx.fillStyle = "#5a3d1e";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#a67c3d";
  for (let y = 0; y < 64; y += 8) ctx.fillRect(0, y, 64, 6);
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
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function CraftingTable() {
  const plankTex = useMemo(buildPlankTexture, []);

  return (
    <group position={[0, -0.1, 0]} scale={1.15}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.45, 1.1]} />
        <meshStandardMaterial map={plankTex} roughness={0.75} />
      </mesh>
      {/* Slim wood rim around the board surface, to frame the cells visually. */}
      <mesh position={[0, 0.46, 0]} receiveShadow>
        <boxGeometry args={[1.26, 0.04, 1.26]} />
        <meshStandardMaterial color="#3a2810" roughness={0.85} />
      </mesh>
    </group>
  );
}
