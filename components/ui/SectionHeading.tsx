"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const reduced = useReducedMotion();
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.header
      className={`mb-12 max-w-2xl ${alignClass}`}
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
    >
      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-emerald">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg text-muted leading-relaxed">{description}</p>
      )}
    </motion.header>
  );
}
