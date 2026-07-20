import { cn } from "@/lib/format";
import type { MatchDTO } from "@/lib/types";

export function matchStatusInfo(m: MatchDTO): { label: string; cls: string } {
  const start = new Date(m.scheduledAt).getTime();
  const now = Date.now();
  const full = m.confirmed.length >= m.capacity;
  if (m.status === "CANCELLED") return { label: "בוטל", cls: "bg-red-500/15 text-red-300" };
  if (m.status === "COMPLETED" || now > start + m.durationMin * 60000)
    return { label: "הסתיים", cls: "bg-white/10 text-slate-300" };
  if (now >= start) return { label: "משחקים עכשיו", cls: "bg-emerald-500/15 text-emerald-300 animate-pulse-soft" };
  if (start - now < 60 * 60 * 1000) return { label: "מתחיל בקרוב", cls: "bg-brand-500/20 text-brand-300" };
  if (full) return { label: "מלא", cls: "bg-white/10 text-slate-300" };
  return { label: "פתוח להרשמה", cls: "bg-emerald-500/15 text-emerald-300" };
}

export function StatusBadge({ match }: { match: MatchDTO }) {
  const info = matchStatusInfo(match);
  return <span className={cn("chip", info.cls)}>{info.label}</span>;
}
