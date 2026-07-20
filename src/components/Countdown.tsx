"use client";

import { useEffect, useState } from "react";
import { countdownTo } from "@/lib/format";

export function Countdown({
  to,
  compact = false,
}: {
  to: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Avoid hydration mismatch: render a neutral placeholder until mounted.
  if (now === null) {
    return <span className="tabular-nums font-bold text-slate-500">··:··</span>;
  }

  const c = countdownTo(to, now);
  if (c.done) {
    return <span className="font-bold text-emerald-400">התחיל 🎮</span>;
  }

  const unit = (v: number, l: string) => (
    <span className="inline-flex flex-col items-center">
      <span className="tabular-nums font-black leading-none">{String(v).padStart(2, "0")}</span>
      <span className="text-[9px] text-slate-500">{l}</span>
    </span>
  );
  const sep = <span className="px-1 text-slate-600">:</span>;

  if (compact) {
    const parts = c.days > 0 ? `${c.days}י ${c.hours}ש׳` : `${String(c.hours).padStart(2, "0")}:${String(c.minutes).padStart(2, "0")}:${String(c.seconds).padStart(2, "0")}`;
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
