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
    <div
      className={`${className ?? ""} overflow-hidden rounded-2xl border border-emerald/25 bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.15),rgba(12,15,20,0.4)_65%)]`}
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
        <CraftingTableModel paused={!active} />
        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.55}
          scale={3.2}
          blur={2}
          far={1.4}
        />
        {!reduced && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.85}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={Math.PI / 4}
          />
        )}
      </Canvas>
    </div>
  );
}
