"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CELL_GAP, CELL_SIZE, GRID } from "@/components/board/scene/BoardSurface";
import type { ClaimEvent } from "@/lib/board-timeline";
import type { PlayerId } from "@/content/types";

const PLAYER_COLOR_HEX: Record<PlayerId, string> = {
  a: "#5b9fd4",
  b: "#e07a5f",
};

const POOL_DESKTOP = 60;
const POOL_MOBILE = 24;
const PARTICLE_LIFETIME = 0.9;
const PARTICLE_SCALE = 0.025;

type Particle = {
  active: boolean;
  age: number;
  velocity: THREE.Vector3;
  spawnPos: THREE.Vector3;
  color: THREE.Color;
};

function cellWorldPos(index: number): THREE.Vector3 {
  const col = index % GRID;
  const row = Math.floor(index / GRID);
  const x = (col - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
  const z = (row - (GRID - 1) / 2) * (CELL_SIZE + CELL_GAP);
  return new THREE.Vector3(x, 0.6, z);
}

type ClaimParticlesProps = {
  lastClaim: ClaimEvent | null;
  reduced: boolean;
};

export function ClaimParticles({ lastClaim, reduced }: ClaimParticlesProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const poolSize = isMobile ? POOL_MOBILE : POOL_DESKTOP;
  const burstSize = isMobile ? 12 : 24;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<Particle[]>(
    Array.from({ length: poolSize }, () => ({
      active: false,
      age: 0,
      velocity: new THREE.Vector3(),
      spawnPos: new THREE.Vector3(),
      color: new THREE.Color(),
    })),
  );
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (!lastClaim || reduced) return;
    const origin = cellWorldPos(lastClaim.index);
    const tint = new THREE.Color(PLAYER_COLOR_HEX[lastClaim.player]);
    let spawned = 0;
    for (let i = 0; i < particles.current.length && spawned < burstSize; i++) {
      const p = particles.current[i];
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      p.spawnPos.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.6 + Math.random() * 0.6;
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.cos(phi)) * speed * 0.7 + 0.4,
        Math.sin(phi) * Math.sin(theta) * speed,
      );
      p.color.copy(tint);
      spawned++;
    }
  }, [lastClaim, reduced, burstSize]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      if (!p.active) {
        matrix.makeScale(0, 0, 0);
        meshRef.current.setMatrixAt(i, matrix);
        continue;
      }
      p.age += delta;
      if (p.age >= PARTICLE_LIFETIME) {
        p.active = false;
        matrix.makeScale(0, 0, 0);
        meshRef.current.setMatrixAt(i, matrix);
        continue;
      }
      const lifeT = p.age / PARTICLE_LIFETIME;
      const x = p.spawnPos.x + p.velocity.x * p.age;
      const y = p.spawnPos.y + p.velocity.y * p.age - 0.5 * 1.6 * p.age * p.age;
      const z = p.spawnPos.z + p.velocity.z * p.age;
      const scale = PARTICLE_SCALE * (1 - lifeT * 0.6);

      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(x, y, z);
      meshRef.current.setMatrixAt(i, matrix);
      color.copy(p.color).multiplyScalar(1 - lifeT * 0.5);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, poolSize]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        emissive="#ffffff"
        emissiveIntensity={1.4}
        color="#ffffff"
        roughness={0.4}
      />
    </instancedMesh>
  );
}
