export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatMatchTime(date: string | Date, locale = "en"): string {
  const d = new Date(date);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString(locale === "he" ? "he-IL" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) return `${locale === "he" ? "היום" : "Today"} • ${time}`;
  if (isTomorrow) return `${locale === "he" ? "מחר" : "Tomorrow"} • ${time}`;

  const day = d.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day} • ${time}`;
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
