"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { viewportOnce } from "@/lib/motion";

const faqs = [
  {
    q: "Is Draftout free?",
    a: "Yes — Draftout is free to play. No pricing tiers on the mode itself.",
  },
  {
    q: "How does 1v1 work technically?",
    a: "Both players run identical single-player worlds with the same seed and RNG. Goals sync via the lockout system so completed objectives are claimed exclusively.",
  },
  {
    q: "What do I need to play?",
    a: "Minecraft Java Edition and the Draftout mod/plugin (install details coming soon).",
  },
  {
    q: "Is there ranked play?",
    a: "Yes — ranked matches feed an Elo leaderboard for competitive play.",
  },
];

export function FAQ() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-4 py-24 sm:px-6">
      <motion.div
        className="mx-auto max-w-2xl"
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportOnce}
      >
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <ul className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <li key={faq.q}>
                <motion.button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-raised px-5 py-4 text-left font-medium"
                  onClick={() => setOpen(isOpen ? null : i)}
                  whileHover={reduced ? undefined : { borderColor: "var(--color-emerald)" }}
                  transition={{ duration: 0.2 }}
                  aria-expanded={isOpen}
                >
                  {faq.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="ml-4 text-emerald text-xl leading-none"
                  >
                    +
                  </motion.span>
                </motion.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 py-4 text-muted leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
