"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

type LoadedTextures = {
  top: THREE.Texture;
  side: THREE.Texture;
  front: THREE.Texture;
};

function loadCraftingTextures(): Promise<LoadedTextures> {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  const configure = (tex: THREE.Texture): THREE.Texture => {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  };

  return Promise.all([
    new Promise<THREE.Texture>((resolve, reject) =>
      loader.load("/board/textures/crafting_table_top.png", (t) => resolve(configure(t)), undefined, reject),
    ),
    new Promise<THREE.Texture>((resolve, reject) =>
      loader.load("/board/textures/crafting_table_side.png", (t) => resolve(configure(t)), undefined, reject),
    ),
    new Promise<THREE.Texture>((resolve, reject) =>
      loader.load("/board/textures/crafting_table_front.png", (t) => resolve(configure(t)), undefined, reject),
    ),
  ]).then(([top, side, front]) => ({ top, side, front }));
}

export function CraftingTable() {
  const [textures, setTextures] = useState<LoadedTextures | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCraftingTextures().then((t) => {
      if (!cancelled) setTextures(t);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!textures) return null;

  // BoxGeometry face order: +x, -x, +y (top), -y (bottom), +z (front), -z (back)
  // Real Minecraft crafting table: 'front' texture goes on the two faces a player would
  // normally see (front + one side); 'side' texture on the other two sides. We use front
  // on +z and +x for visual interest, side on -z and -x.
  const materials = [
    new THREE.MeshStandardMaterial({ map: textures.front, roughness: 0.78 }), // +x
    new THREE.MeshStandardMaterial({ map: textures.side, roughness: 0.78 }),  // -x
    new THREE.MeshStandardMaterial({ map: textures.top, roughness: 0.65 }),   // +y top
    new THREE.MeshStandardMaterial({ map: textures.side, roughness: 0.78 }),  // -y bottom
    new THREE.MeshStandardMaterial({ map: textures.front, roughness: 0.78 }), // +z front
    new THREE.MeshStandardMaterial({ map: textures.side, roughness: 0.78 }),  // -z back
  ];

  // Block size 1.5 — bigger than before so the board sits clearly on top with margin.
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow material={materials}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
      </mesh>
      {/* Emerald edge accent just above the top, brand reinforcement */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[1.54, 0.014, 1.54]} />
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
