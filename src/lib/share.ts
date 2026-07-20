import { formatFullDate } from "./format";

export function whatsappLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface ShareMatch {
  title: string;
  scheduledAt: string | Date;
  url: string;
  confirmed: number;
  capacity: number;
  discordLink?: string | null;
}

export function buildShareText(m: ShareMatch): string {
  return (
    `🎮 נפתח קומפ: ${m.title}\n` +
    `🗓️ ${formatFullDate(m.scheduledAt)}\n` +
    `👥 רשומים ${m.confirmed} מתוך ${m.capacity}\n` +
    `להצטרפות: ${m.url}`
  );
}

export function buildIcs(m: ShareMatch): string {
  const start = new Date(m.scheduledAt);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const uid = `${fmt(start)}-${Math.abs(hash(m.title))}@whencomp`;
  const desc = [`קומפ WHEN COMP`, m.discordLink ? `דיסקורד: ${m.discordLink}` : "", `פרטים: ${m.url}`]
    .filter(Boolean)
    .join("\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WHEN COMP//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(start)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeIcs(m.title)} — WHEN COMP`,
    `DESCRIPTION:${desc}`,
    m.url ? `URL:${m.url}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:הקומפ מתחיל בעוד שעה",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

// Google Calendar "create event" template URL (works on web + Android + iOS).
export function googleCalendarUrl(m: ShareMatch): string {
  const start = new Date(m.scheduledAt);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const details = [`קומפ WHEN COMP`, m.discordLink ? `דיסקורד: ${m.discordLink}` : "", m.url].filter(Boolean).join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${m.title} — WHEN COMP`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(m: ShareMatch) {
  const blob = new Blob([buildIcs(m)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `whencomp-${Math.abs(hash(m.title))}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function nativeShare(m: ShareMatch): Promise<boolean> {
  const text = buildShareText(m);
  if (typeof navigator !== "undefined" && (navigator as any).share) {
    try {
      await (navigator as any).share({ title: m.title, text, url: m.url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function escapeIcs(s: string) {
  return s.replace(/([,;\\])/g, "\\$1");
}
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}
