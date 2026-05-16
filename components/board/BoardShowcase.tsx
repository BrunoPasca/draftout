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
      <motion.div
        className="h-full w-full animate-pulse rounded-xl bg-surface-raised"
        aria-hidden
      />
    ),
  },
);

export function BoardShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-80px" });

  return (
    <BoardClaimProvider>
      <motion.div
        ref={sectionRef}
        className="relative flex flex-col items-center gap-4 lg:gap-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="relative z-0 h-[200px] w-full max-w-lg sm:h-[240px] lg:absolute lg:left-1/2 lg:top-1/2 lg:h-[320px] lg:w-[min(100%,520px)] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-[55%]">
          <BoardCanvas active={inView} className="h-full w-full" />
        </div>

        <motion.div className="relative z-10 w-full max-w-md lg:max-w-lg lg:pt-8">
          <div className="rounded-2xl border border-border/80 bg-surface/90 p-3 shadow-lg backdrop-blur-sm sm:p-4 lg:bg-surface/85">
            <BingoGrid />
          </div>
        </motion.div>
      </motion.div>
    </BoardClaimProvider>
  );
}
