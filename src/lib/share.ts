// Client-side sharing helpers: Web Share API, WhatsApp deep links, .ics calendar.

export function whatsappLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface ShareMatch {
  title: string;
  game: string;
  scheduledAt: string | Date;
  url: string;
  discordLink?: string | null;
}

export function buildShareText(m: ShareMatch): string {
  const when = new Date(m.scheduledAt).toLocaleString();
  return `🎮 ${m.title} — ${m.game}\n🗓️ ${when}\nJoin the comp: ${m.url}`;
}

/** Build a downloadable .ics calendar event string. */
export function buildIcs(m: ShareMatch): string {
  const start = new Date(m.scheduledAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1h
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const uid = `${fmt(start)}-${Math.abs(hash(m.title))}@whencomp`;
  const desc = [
    `Game: ${m.game}`,
    m.discordLink ? `Discord: ${m.discordLink}` : "",
    `Details: ${m.url}`,
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//When Comp//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date(start.getTime()))}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeIcs(m.title)} (${m.game})`,
    `DESCRIPTION:${desc}`,
    m.url ? `URL:${m.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(m: ShareMatch) {
  const blob = new Blob([buildIcs(m)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${m.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
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
