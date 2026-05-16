"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { BoardSurface } from "@/components/board/scene/BoardSurface";
import { CraftingTable } from "@/components/board/scene/CraftingTable";
import { CameraRig } from "@/components/board/scene/CameraRig";
import { ClaimParticles } from "@/components/board/scene/ClaimParticles";
import type { ClaimEvent } from "@/lib/board-timeline";
import type { PlayerId } from "@/content/types";

type BoardSceneProps = {
  active: boolean;
  owners: (PlayerId | null)[];
  latestIndex: number | null;
  lastClaim: ClaimEvent | null;
  isClimax: boolean;
  className?: string;
};

export function BoardScene({
  active,
  owners,
  latestIndex,
  lastClaim,
  isClimax,
  className,
}: BoardSceneProps) {
  const reduced = useReducedMotion();
  const isDesktop = typeof window === "undefined" || window.innerWidth >= 1024;
  const enablePost = !reduced && isDesktop;

  return (
    <div
      className={`${className ?? ""} relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.15),rgba(12,15,20,0.4)_65%)]`}
      aria-hidden
    >
      <Canvas
        camera={{ position: [2.4, 2, 2.6], fov: 40 }}
        dpr={[1, reduced ? 1 : isDesktop ? 2 : 1.5]}
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
        <ClaimParticles lastClaim={lastClaim} reduced={reduced ?? false} />
        <CameraRig
          lastClaim={lastClaim}
          isClimax={isClimax}
          active={active}
          reduced={reduced ?? false}
        />

        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.55}
          scale={3.2}
          blur={2}
          far={1.4}
        />

        {enablePost && (
          <EffectComposer>
            <Bloom
              intensity={isClimax ? 1.4 : 0.25}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(isClimax ? 0.0025 : 0.0, isClimax ? 0.0025 : 0.0)}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
