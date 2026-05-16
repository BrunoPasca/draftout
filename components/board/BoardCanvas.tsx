"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { CraftingTableModel } from "@/components/board/CraftingTableModel";

type BoardCanvasProps = {
  active: boolean;
  className?: string;
};

export function BoardCanvas({ active, className }: BoardCanvasProps) {
  const reduced = useReducedMotion();

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [2.2, 1.8, 2.4], fov: 42 }}
        dpr={[1, reduced ? 1 : 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <CraftingTableModel paused={!active} />
        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.45}
          scale={3}
          blur={2.5}
          far={1.2}
        />
        {!reduced && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 4}
          />
        )}
      </Canvas>
    </div>
  );
}
