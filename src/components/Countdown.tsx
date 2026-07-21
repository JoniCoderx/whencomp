"use client";

import { useEffect, useState } from "react";
import { countdownTo, countdownTextHe } from "@/lib/format";
import { useNow } from "@/lib/useNow";

export function Countdown({
  to,
  compact = false,
  text = false,
}: {
  to: string;
  compact?: boolean;
  text?: boolean;
}) {
  const now = useNow(); // shared 1s ticker, pauses on hidden tab
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: neutral placeholder until mounted on the client.
  if (!mounted) {
    return <span className="tabular-nums font-bold text-slate-500">··:··</span>;
  }

  // Hebrew sentence form: "מתחיל בעוד 3 שעות ו־12 דקות"
  if (text) {
    const label = countdownTextHe(to, now);
    const started = label === "הקומפ התחיל";
    return <span className={started ? "font-bold text-emerald-400" : "font-bold text-brand-400"}>{label}</span>;
  }

  const c = countdownTo(to, now);
  if (c.done) return <span className="font-bold text-emerald-400">התחיל 🎮</span>;

  const unit = (v: number, l: string) => (
    <span className="inline-flex flex-col items-center">
      <span className="tabular-nums font-black leading-none">{String(v).padStart(2, "0")}</span>
      <span className="text-[9px] text-slate-500">{l}</span>
    </span>
  );
  const sep = <span className="px-1 text-slate-600">:</span>;

  if (compact) {
    const parts =
      c.days > 0
        ? `${c.days}י ${c.hours}ש׳`
        : `${String(c.hours).padStart(2, "0")}:${String(c.minutes).padStart(2, "0")}:${String(c.seconds).padStart(2, "0")}`;
    return <span className="tabular-nums font-bold text-brand-400">{parts}</span>;
  }

  return (
    <div className="flex items-center text-brand-400" dir="ltr">
      {c.days > 0 && (
        <>
          {unit(c.days, "ימים")}
          {sep}
        </>
      )}
      {unit(c.hours, "שעות")}
      {sep}
      {unit(c.minutes, "דק׳")}
      {sep}
      {unit(c.seconds, "שנ׳")}
    </div>
  );
}
