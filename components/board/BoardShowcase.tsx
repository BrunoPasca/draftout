"use client";

import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BingoGrid } from "@/components/board/BingoGrid";
import { BoardClaimProvider } from "@/lib/board-claim-context";

const BoardCanvas = dynamic(
  () => import("@/components/board/BoardCanvas").then((m) => m.BoardCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse rounded-xl border border-emerald/20 bg-surface-raised"
        aria-hidden
      />
    ),
  },
);

export function BoardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-80px", amount: 0.2 });

  return (
    <BoardClaimProvider>
      <motion.div
        ref={sectionRef}
        className="relative flex min-h-[520px] flex-col items-center gap-6 lg:min-h-[480px] lg:gap-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="relative z-0 h-[240px] w-full sm:h-[280px] lg:absolute lg:left-1/2 lg:top-[38%] lg:h-[400px] lg:w-[min(100%,580px)] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2">
          <BoardCanvas active={inView} className="h-full w-full" />
        </div>

        <motion.div className="relative z-10 w-full max-w-md lg:max-w-md lg:pt-24">
          <div className="rounded-2xl border border-border/80 bg-surface/70 p-3 backdrop-blur-md sm:p-4 lg:bg-surface/50">
            <BingoGrid />
          </div>
        </motion.div>
      </motion.div>
    </BoardClaimProvider>
  );
}
