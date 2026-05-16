"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BoardShowcase } from "@/components/board/BoardShowcase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { viewportOnce } from "@/lib/motion";

export function Board() {
  const reduced = useReducedMotion();

  return (
    <section id="board" className="overflow-hidden px-4 py-24 sm:px-6">
      <motion.div
        className="mx-auto max-w-5xl"
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
        <BoardShowcase />
      </motion.div>
    </section>
  );
}
