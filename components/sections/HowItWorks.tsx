"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cardReveal, staggerContainer, viewportOnce } from "@/lib/motion";

const phases = [
  {
    title: "The Draft",
    description:
      "Take turns picking between two proposed goals until all 25 slots on the bingo board are filled — play to your strengths, deny your opponent theirs.",
    step: "01",
  },
  {
    title: "The Race",
    description:
      "Both players drop into identical single-player survival worlds with the same seed and RNG. No excuses — pure execution.",
    step: "02",
  },
  {
    title: "The Lockout",
    description:
      "First to complete any 13 goals wins. When you finish a goal, it's yours — your opponent can never claim it.",
    step: "03",
  },
];

export function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="px-4 py-24 sm:px-6">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <SectionHeading
          eyebrow="How it works"
          title="Three phases. One winner."
          description="Every match follows the same rhythm — strategy in the draft, speed in the race, tension in the lockout."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {phases.map((phase) => (
            <motion.article
              key={phase.title}
              variants={cardReveal}
              className="group rounded-2xl border border-border bg-surface-raised p-6"
              whileHover={reduced ? undefined : { y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <span className="font-mono text-sm text-emerald">{phase.step}</span>
              <h3 className="mt-3 text-xl font-semibold">{phase.title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{phase.description}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
