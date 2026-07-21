export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const TZ = "Asia/Jerusalem";

export function formatMatchTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const fmtDay = (x: Date) =>
    x.toLocaleDateString("he-IL", { timeZone: TZ, day: "numeric", month: "numeric", year: "numeric" });
  const sameDay = fmtDay(d) === fmtDay(now);
  const tomorrow = new Date(now.getTime() + 86400000);
  const isTomorrow = fmtDay(d) === fmtDay(tomorrow);
  const time = d.toLocaleTimeString("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `היום · ${time}`;
  if (isTomorrow) return `מחר · ${time}`;
  const day = d.toLocaleDateString("he-IL", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
  return `${day} · ${time}`;
}

export function formatTimeOnly(date: string | Date): string {
  return new Date(date).toLocaleTimeString("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
}

export function formatDayHeading(date: string | Date): string {
  return new Date(date).toLocaleDateString("he-IL", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatFullDate(date: string | Date): string {
  return new Date(date).toLocaleString("he-IL", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dayKey(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
  total: number;
}

export function countdownTo(date: string | Date, now = Date.now()): Countdown {
  const total = Math.max(0, new Date(date).getTime() - now);
  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: total <= 0,
    total,
  };
}

const heDays = (n: number) => (n === 1 ? "יום" : `${n} ימים`);
const heHours = (n: number) => (n === 1 ? "שעה" : `${n} שעות`);
const heMins = (n: number) => (n === 1 ? "דקה" : `${n} דקות`);

// Hebrew countdown text per spec: "מתחיל בעוד 3 שעות ו־12 דקות" etc.
export function countdownTextHe(date: string | Date, now = Date.now()): string {
  const c = countdownTo(date, now);
  if (c.done) return "הקומפ התחיל";
  if (c.days >= 1) return `מתחיל בעוד ${heDays(c.days)}`;
  if (c.hours >= 1)
    return `מתחיל בעוד ${heHours(c.hours)}${c.minutes ? ` ו־${heMins(c.minutes)}` : ""}`;
  if (c.minutes >= 1) return `מתחיל בעוד ${heMins(c.minutes)}`;
  return "מתחיל בעוד פחות מדקה";
}

export type MatchPhase = "upcoming" | "soon" | "live" | "ended";

// One consistent phase machine driven off UTC timestamps.
export function matchPhase(
  startIso: string | Date,
  durationMin = 90,
  now = Date.now(),
  status?: string
): MatchPhase {
  if (status === "COMPLETED") return "ended";
  const start = new Date(startIso).getTime();
  const end = start + durationMin * 60000;
  if (now >= end) return "ended";
  if (now >= start) return "live";
  if (start - now <= 60 * 60 * 1000) return "soon";
  return "upcoming";
}
