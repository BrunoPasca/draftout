"use client";

import { useEffect, useRef, useState } from "react";

type TextScrambleProps = {
  phrases: string[];
  chars?: string;
  intervalMs?: number;
  className?: string;
  dudClassName?: string;
  enabled?: boolean;
};

type QueueItem = {
  from: string;
  to: string;
  start: number;
  end: number;
  char?: string;
};

const DEFAULT_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function TextScramble({
  phrases,
  chars = DEFAULT_CHARS,
  intervalMs = 2000,
  className,
  dudClassName = "opacity-50",
  enabled = true,
}: TextScrambleProps) {
  const elRef = useRef<HTMLSpanElement>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const frameRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || phrases.length === 0) return;

    const el = elRef.current;
    if (!el) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const escapeHtml = (s: string) =>
      s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    const setText = (newText: string) =>
      new Promise<void>((resolve) => {
        const oldText = el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const queue: QueueItem[] = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || "";
          const to = newText[i] || "";
          const start = Math.floor(Math.random() * 20);
          const end = start + Math.floor(Math.random() * 20);
          queue.push({ from, to, start, end });
        }
        queueRef.current = queue;
        frameCountRef.current = 0;

        const step = () => {
          if (cancelled) return;
          let output = "";
          let complete = 0;
          const q = queueRef.current;

          for (let i = 0; i < q.length; i++) {
            const item = q[i];
            if (frameCountRef.current >= item.end) {
              complete++;
              output += escapeHtml(item.to);
            } else if (frameCountRef.current >= item.start) {
              if (!item.char || Math.random() < 0.28) {
                item.char = chars[Math.floor(Math.random() * chars.length)];
              }
              output += `<span class="${dudClassName}">${escapeHtml(item.char)}</span>`;
            } else {
              output += escapeHtml(item.from);
            }
          }

          el.innerHTML = output;

          if (complete === q.length) {
            resolve();
          } else {
            frameCountRef.current++;
            frameRef.current = requestAnimationFrame(step);
          }
        };

        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(step);
      });

    const run = async () => {
      await setText(phrases[index]);
      if (cancelled) return;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => (i + 1) % phrases.length);
      }, intervalMs);
    };

    run();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [chars, dudClassName, enabled, index, intervalMs, phrases]);

  if (!enabled) {
    return <span className={className}>{phrases.join(" · ")}</span>;
  }

  return (
    <span
      ref={elRef}
      className={className}
      aria-live="polite"
    >
      {phrases[0]}
    </span>
  );
}
