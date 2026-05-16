"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeOut } from "@/lib/motion";

type BlurFadeProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
  as?: "div" | "span";
  className?: string;
};

export function BlurFade({
  children,
  delay = 0,
  duration = 0.55,
  yOffset = 12,
  blur = "8px",
  as = "div",
  className,
}: BlurFadeProps) {
  const reduced = useReducedMotion();
  const Component = as === "span" ? motion.span : motion.div;

  return (
    <Component
      className={className}
      initial={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, y: yOffset, filter: `blur(${blur})` }
      }
      animate={
        reduced
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      transition={{ delay, duration, ease: easeOut }}
    >
      {children}
    </Component>
  );
}
