"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ShimmerButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
};

export function ShimmerButton({
  href,
  children,
  className = "",
  onClick,
  variant = "primary",
}: ShimmerButtonProps) {
  const reduced = useReducedMotion();

  const base =
    "relative inline-flex items-center justify-center overflow-hidden rounded-xl px-8 py-3.5 font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-emerald text-surface shadow-[0_0_0_1px_rgba(61,214,140,0.4),0_8px_24px_-12px_rgba(61,214,140,0.6)]"
      : "border border-border text-foreground hover:border-emerald";

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && !reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-150%" }}
          animate={{ x: "350%" }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1.2,
          }}
        />
      )}
    </>
  );

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.25 },
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${base} ${styles} ${className}`}
        {...motionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
