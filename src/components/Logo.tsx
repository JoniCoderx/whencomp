"use client";

import { useEffect, useRef, useState } from "react";

export function LogoMark({ size = 36, float = false }: { size?: number; float?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={float ? "wc-logo-float" : undefined}
    >
      <defs>
        <linearGradient id="wc-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M24 2l19 11v22L24 46 5 35V13L24 2z" fill="#0b0d10" stroke="url(#wc-g)" strokeWidth="2.2" />
      <circle cx="24" cy="24" r="8" stroke="url(#wc-g)" strokeWidth="2.4" />
      <path d="M24 9v7M24 32v7M9 24h7M32 24h7" stroke="url(#wc-g)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.2" fill="#fbbf24" />
    </svg>
  );
}

const EN = (
  <span dir="ltr" className="font-display text-lg font-black tracking-[0.14em] leading-none whitespace-nowrap">
    WHEN<span className="text-brand-500"> COMP</span>
  </span>
);
const HE = (
  <span dir="rtl" className="font-display text-lg font-black leading-none whitespace-nowrap">
    מתי<span className="text-brand-500"> קומפ</span>
  </span>
);

export function Logo({ size = 36 }: { size?: number }) {
  const [showEn, setShowEn] = useState(true);
  const [animate, setAnimate] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Respect reduced motion — keep the static wordmark.
    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (rm?.matches) return;
    setAnimate(true);

    const start = () => {
      if (timer.current) return;
      timer.current = setInterval(() => setShowEn((v) => !v), 5000);
    };
    const stop = () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
    const onVis = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <span className="flex items-center gap-2.5 no-tap wc-logo-float-wrap">
      <LogoMark size={size} float={animate} />
      {/* Grid-stack: both wordmarks share one cell → container sizes to the
          widest, so the nav never shifts. Only transform/opacity animate. */}
      <span className="grid place-items-center">
        <span
          className="[grid-area:1/1] transition-all duration-500 ease-out"
          style={
            animate
              ? { opacity: showEn ? 1 : 0, filter: showEn ? "blur(0)" : "blur(6px)", transform: showEn ? "none" : "translateY(-4px)" }
              : undefined
          }
        >
          {EN}
        </span>
        <span
          aria-hidden
          className="[grid-area:1/1] transition-all duration-500 ease-out"
          style={{
            opacity: animate ? (showEn ? 0 : 1) : 0,
            filter: showEn ? "blur(6px)" : "blur(0)",
            transform: showEn ? "translateY(4px)" : "none",
            pointerEvents: "none",
          }}
        >
          {HE}
        </span>
      </span>
    </span>
  );
}
