"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { BoardSurface } from "@/components/board/scene/BoardSurface";
import { CraftingTable } from "@/components/board/scene/CraftingTable";
import type { PlayerId } from "@/content/types";

type BoardSceneProps = {
  active: boolean;
  owners: (PlayerId | null)[];
  latestIndex: number | null;
  className?: string;
};

export function BoardScene({ active, owners, latestIndex, className }: BoardSceneProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={`${className ?? ""} relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.15),rgba(12,15,20,0.4)_65%)]`}
      aria-hidden
    >
      <Canvas
        camera={{ position: [2.4, 2, 2.6], fov: 40 }}
        dpr={[1, reduced ? 1 : 2]}
        frameloop={active ? "always" : "demand"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[5, 8, 4]} intensity={1.65} castShadow />
        <directionalLight position={[-4, 3, -2]} intensity={0.55} />
        <pointLight position={[0, 2.5, 2]} intensity={1} color="#3dd68c" />
        <CraftingTable />
        <BoardSurface owners={owners} latestIndex={latestIndex} />
        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.55}
          scale={3.2}
          blur={2}
          far={1.4}
        />
      </Canvas>
    </div>
  );
}
