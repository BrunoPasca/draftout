"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 pt-24 pb-20 sm:px-6">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(61,214,140,0.12),transparent)]"
        aria-hidden
        animate={reduced ? undefined : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative z-10 mx-auto max-w-3xl text-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={item}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald"
        >
          Minecraft · 1v1 · Speedrun × Bingo
        </motion.p>
        <motion.h1
          variants={item}
          className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
        >
          Draft your board.
          <br />
          <span className="text-emerald">Race to thirteen.</span>
        </motion.h1>
        <motion.p variants={item} className="mt-6 text-lg text-muted sm:text-xl">
          Competitive lockout bingo for two players — identical worlds, same seed,
          first to complete 13 of 25 drafted goals wins.
        </motion.p>
        <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-4">
          <motion.a
            href="#cta"
            className="rounded-xl bg-emerald px-8 py-3.5 font-semibold text-surface"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            Play free
          </motion.a>
          <motion.a
            href="#board"
            className="rounded-xl border border-border px-8 py-3.5 font-semibold text-foreground"
            whileHover={{ scale: 1.02, borderColor: "var(--color-emerald)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            See the board
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
