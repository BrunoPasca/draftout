"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function FooterCta() {
  const reduced = useReducedMotion();

  return (
    <footer id="cta" className="px-4 pb-16 pt-8 sm:px-6">
      <motion.div
        className="mx-auto max-w-3xl rounded-3xl border border-border bg-[radial-gradient(ellipse_at_center,rgba(61,214,140,0.08),transparent)] px-6 py-16 text-center sm:px-12"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
      >
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to draft your first board?</h2>
        <p className="mt-4 text-lg text-muted">
          Jump into a 1v1 lockout race — free, ranked, and built for competitive Minecraft.
        </p>
        <motion.a
          href="#"
          className="mt-8 inline-block rounded-xl bg-emerald px-10 py-4 font-semibold text-surface"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          Play free
        </motion.a>
        <p className="mt-12 text-sm text-muted">
          © {new Date().getFullYear()} Draftout · Minecraft fan project
        </p>
        <p className="mt-2 text-xs text-muted/70">
          Goal icons from Faithful 32× — used under the Faithful License v3.{" "}
          <a
            href="https://faithfulpack.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-muted/40 hover:decoration-emerald hover:text-emerald"
          >
            faithfulpack.net
          </a>
        </p>
      </motion.div>
    </footer>
  );
}
