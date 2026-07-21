// Only http(s) URLs are safe to put in href/src. Rejects javascript:, data:,
// vbscript:, etc. Used both server-side (validation) and at render time.
export function safeHttpUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  const s = u.trim();
  try {
    const parsed = new URL(s);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return s;
    return null;
  } catch {
    return null;
  }
}

// Zod refinement helper: allow empty string or a valid http(s) URL.
export function isSafeHttpOrEmpty(u: string | undefined): boolean {
  if (!u) return true;
  return safeHttpUrl(u) !== null;
}
