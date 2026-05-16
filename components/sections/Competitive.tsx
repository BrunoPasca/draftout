"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cardReveal, staggerContainer, viewportOnce } from "@/lib/motion";

const stats = [
  { label: "Ranked Elo", value: "Climb the ladder" },
  { label: "1v1 only", value: "Pure head-to-head" },
  { label: "Same seed", value: "Fair worlds" },
];

export function Competitive() {
  const reduced = useReducedMotion();

  return (
    <section id="competitive" className="border-y border-border bg-surface-raised/40 px-4 py-24 sm:px-6">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <SectionHeading
          eyebrow="Competitive"
          title="Built for speedrunners and creators"
          description="Ranked matches feed an Elo leaderboard — the mode that's taken hold with competitive Minecraft players and streamers."
        />
        <motion.div className="grid gap-6 sm:grid-cols-3" variants={staggerContainer}>
          {stats.map((stat) => (
            <motion.article
              key={stat.label}
              variants={cardReveal}
              className="rounded-2xl border border-border bg-surface p-6 text-center"
              whileHover={reduced ? undefined : { y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-emerald">
                {stat.label}
              </p>
              <p className="mt-3 text-lg font-semibold">{stat.value}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
