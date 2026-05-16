"use client";

import { useEffect, useRef } from "react";

type DottedSurfaceProps = {
  dotColor?: string;
  bloomColor?: string;
  dotSize?: number;
  spacing?: number;
  bloomRadius?: number;
  interactive?: boolean;
  className?: string;
};

export function DottedSurface({
  dotColor = "#2a3548",
  bloomColor = "rgba(61, 214, 140, 0.8)",
  dotSize = 1.4,
  spacing = 28,
  bloomRadius = 220,
  interactive = true,
  className,
}: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGrid = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const { x: mx, y: my } = mouseRef.current;
      const r2 = bloomRadius * bloomRadius;

      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          const dx = x - mx;
          const dy = y - my;
          const dist2 = dx * dx + dy * dy;

          if (interactive && dist2 < r2) {
            const t = 1 - dist2 / r2;
            ctx.globalAlpha = 0.35 + t * 0.65;
            ctx.fillStyle = bloomColor;
            ctx.beginPath();
            ctx.arc(x, y, dotSize + t * 1.8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.globalAlpha = 1;
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();
    drawGrid();

    if (!interactive) {
      window.addEventListener("resize", () => {
        resize();
        drawGrid();
      });
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const loop = () => {
      drawGrid();
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bloomColor, bloomRadius, dotColor, dotSize, interactive, spacing]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
    />
  );
}
