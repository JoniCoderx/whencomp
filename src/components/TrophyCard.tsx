"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/format";
import type { Trophy } from "@/lib/queries";

// 3D-tilt trophy badge that reacts to pointer position.
export function TrophyCard({ trophy }: { trophy: Trophy }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 15,
  });

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={cn(
        "card relative flex flex-col items-center justify-center gap-1 text-center transition",
        trophy.earned ? "shadow-neon-purple" : "opacity-40 grayscale"
      )}
    >
      <div
        style={{ transform: "translateZ(30px)" }}
        className="text-4xl drop-shadow-[0_4px_12px_rgba(168,85,247,0.5)]"
      >
        {trophy.earned ? trophy.emoji : "🔒"}
      </div>
      <p className="font-display text-sm font-bold" style={{ transform: "translateZ(20px)" }}>
        {trophy.label}
      </p>
      <p className="text-[11px] text-slate-400" style={{ transform: "translateZ(10px)" }}>
        {trophy.desc}
      </p>
    </motion.div>
  );
}
