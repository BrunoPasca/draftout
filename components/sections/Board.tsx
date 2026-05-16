"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BingoGrid } from "@/components/board/BingoGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { viewportOnce } from "@/lib/motion";

export function Board() {
  const reduced = useReducedMotion();

  return (
    <section id="board" className="px-4 py-24 sm:px-6">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={reduced ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          eyebrow="The board"
          title="Twenty-five goals. Thirteen to win."
          description="Watch the lockout in action — each completed goal is yours alone. Your opponent can never claim it."
        />
        <motion.div
          className="rounded-2xl border border-border bg-surface-raised/50 p-4 sm:p-6"
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <BingoGrid />
        </motion.div>
      </motion.div>
    </section>
  );
}
