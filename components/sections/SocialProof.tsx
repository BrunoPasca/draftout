"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, viewportOnce } from "@/lib/motion";

const quotes = [
  {
    text: "The draft phase completely changes how you think about bingo — you're playing the opponent, not just the board.",
    author: "Competitive speedrunner",
  },
  {
    text: "Lockout races are brutal in the best way. One goal can swing the whole match.",
    author: "Content creator",
  },
];

export function SocialProof() {
  const reduced = useReducedMotion();

  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Community"
          title="Played by people who hate losing"
          description="Draftout has found its audience among competitive Minecraft players who want something sharper than casual bingo."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {quotes.map((quote, i) => (
            <motion.blockquote
              key={quote.author}
              className="rounded-2xl border border-border bg-surface-raised p-6"
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-lg leading-relaxed text-foreground">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-4 text-sm text-muted">— {quote.author}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
