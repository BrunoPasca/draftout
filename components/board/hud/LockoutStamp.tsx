"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type LockoutStampProps = {
  visible: boolean;
};

export function LockoutStamp({ visible }: LockoutStampProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.4 }}
        >
          <motion.span
            className="rounded-md bg-emerald px-8 py-3 text-4xl font-extrabold tracking-[0.3em] text-surface shadow-[0_0_60px_rgba(61,214,140,0.6)] sm:text-6xl"
            initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)", scale: 1.05 }}
            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)", scale: 1 }}
            exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)", scale: 0.98 }}
            transition={{ duration: reduced ? 0.2 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            LOCKOUT
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
