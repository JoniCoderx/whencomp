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
