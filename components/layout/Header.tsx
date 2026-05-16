"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Header() {
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-surface/80 backdrop-blur-md"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Link href="/" className="font-bold tracking-tight text-foreground">
          Draftout
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="#board" className="hover:text-foreground transition-colors">
            The board
          </Link>
          <motion.a
            href="#cta"
            className="rounded-lg bg-emerald px-4 py-2 font-medium text-surface"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            Play free
          </motion.a>
        </nav>
      </motion.div>
    </motion.header>
  );
}
