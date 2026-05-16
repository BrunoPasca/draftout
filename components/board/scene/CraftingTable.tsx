"use client";

import { useMemo } from "react";
import * as THREE from "three";

function buildPlankSideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("plank side texture: 2d ctx unavailable");
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
  // Subtle vertical knots to read as wood
  ctx.fillStyle = "#7c5a2c";
  ctx.fillRect(10, 12, 2, 6);
  ctx.fillRect(34, 28, 2, 6);
  ctx.fillRect(50, 44, 2, 6);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function buildPlankTopTexture(): THREE.CanvasTexture {
  // Slightly darker base + visible 3×3 craft-grid pattern at the corners
  // (most of the centre will be hidden by the BoardSurface cells).
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("plank top texture: 2d ctx unavailable");
  // Base: dark wood
  ctx.fillStyle = "#3f2a13";
  ctx.fillRect(0, 0, 64, 64);
  // Lighter plank highlights running diagonally — gives "worktop" feel
  ctx.fillStyle = "#6a4a1f";
  ctx.fillRect(0, 4, 64, 4);
  ctx.fillRect(0, 20, 64, 4);
  ctx.fillRect(0, 36, 64, 4);
  ctx.fillRect(0, 52, 64, 4);
  // 3×3 craft grid inset (visible at the corners around the board)
  ctx.strokeStyle = "#1a1108";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 48, 48);
  ctx.beginPath();
  ctx.moveTo(8, 24);
  ctx.lineTo(56, 24);
  ctx.moveTo(8, 40);
  ctx.lineTo(56, 40);
  ctx.moveTo(24, 8);
  ctx.lineTo(24, 56);
  ctx.moveTo(40, 8);
  ctx.lineTo(40, 56);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

export function CraftingTable() {
  const sideTex = useMemo(buildPlankSideTexture, []);
  const topTex = useMemo(buildPlankTopTexture, []);

  // BoxGeometry face order: +x, -x, +y, -y, +z, -z (right, left, top, bottom, front, back)
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.78 }),
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.78 }),
      new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.78 }),
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.78 }),
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.78 }),
    ],
    [sideTex, topTex],
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Cubic Minecraft-block body, centered at y=0, top face at y=0.5 */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        material={materials}
      >
        <boxGeometry args={[1.0, 1.0, 1.0]} />
      </mesh>
      {/* Subtle emerald edge accent just above the top, matches brand */}
      <mesh position={[0, 0.51, 0]}>
        <boxGeometry args={[1.03, 0.012, 1.03]} />
        <meshStandardMaterial
          color="#3dd68c"
          emissive="#3dd68c"
          emissiveIntensity={0.45}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
