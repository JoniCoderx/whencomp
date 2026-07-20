"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { googleCalendarUrl, type ShareMatch } from "@/lib/share";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";

// Add-to-calendar with two reliable options: Google Calendar (web/Android/iOS)
// and an .ics file served with real headers (Apple Calendar / Outlook).
export function CalendarButton({
  matchId,
  share,
  compact = false,
}: {
  matchId: string;
  share: ShareMatch;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { sfx.soft(); setOpen((v) => !v); }}
        className={cn("btn-ghost no-tap", compact ? "!px-3 !py-2 text-sm" : "text-sm")}
        title="הוספה ליומן"
      >
        🗓️{!compact && " התראה ליומן"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="absolute z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card"
            style={{ insetInlineStart: 0 }}
          >
            <a
              href={googleCalendarUrl(share)}
              target="_blank"
              rel="noreferrer"
              onClick={() => { sfx.click(); setOpen(false); }}
              className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 no-tap"
            >
              📅 Google Calendar
            </a>
            <a
              href={`/api/matches/${matchId}/ics`}
              onClick={() => { sfx.click(); setOpen(false); }}
              className="flex items-center gap-2 border-t border-white/5 px-4 py-3 text-sm hover:bg-white/5 no-tap"
            >
              🍎 Apple / Outlook
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
