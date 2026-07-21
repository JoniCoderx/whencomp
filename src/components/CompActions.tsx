"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";
import { matchStatusInfo } from "./StatusBadge";
import type { MatchDTO } from "@/lib/types";

export function CompActions({ match, full = false }: { match: MatchDTO; full?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const isGuest = (session?.user as any)?.isGuest === true;
  const guestBlocked = isGuest && !match.allowGuests;

  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mine =
    match.confirmed.find((p) => p.userId === userId) ||
    match.waitlist.find((p) => p.userId === userId) ||
    match.cancelled.find((p) => p.userId === userId);
  const myStatus = mine?.status;
  const isFull = match.confirmed.length >= match.capacity;
  const closed = ["CANCELLED", "COMPLETED"].includes(match.status) || matchStatusInfo(match).label === "הסתיים";

  async function join() {
    if (!userId) return router.push("/login");
    setLoading(true);
    setError(null);
    sfx.join();
    try {
      const res = await fetch(`/api/matches/${match.id}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "שגיאה"); return; }
      setConfirmMsg(
        data.status === "WAITLIST"
          ? "נכנסת לרשימת ההמתנה. נעדכן אם מתפנה מקום."
          : "אישרת הגעה לקומפ. אנחנו סומכים עליך שתגיע 💪"
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    setLoading(true);
    setError(null);
    sfx.soft();
    try {
      const res = await fetch(`/api/matches/${match.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "שגיאה"); return; }
      setShowCancel(false);
      setReason("");
      setConfirmMsg(data.late ? "ביטלת הגעה (ביטול מאוחר)." : "ביטלת הגעה. תודה שעדכנת.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (closed) {
    return <div className="rounded-xl bg-white/5 py-3 text-center text-sm text-slate-400">{matchStatusInfo(match).label}</div>;
  }

  // Guest trying to act on a comp that disallows guests — explain instead of
  // showing a button that would only 403.
  if (guestBlocked && (!mine || myStatus === "OUT")) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm text-slate-300">
        הקומפ סגור לאורחים.{" "}
        <button onClick={() => router.push("/login")} className="font-bold text-brand-400 underline no-tap">
          הירשמו כדי להצטרף
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {confirmMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-300"
          >
            {confirmMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      {!mine || myStatus === "OUT" ? (
        <button onClick={join} disabled={loading} className={cn("w-full py-3 no-tap", "btn-primary")}>
          {loading ? "..." : isFull ? "הצטרפות לרשימת המתנה" : myStatus === "OUT" ? "אני מגיע/ה שוב" : t("board.join")}
        </button>
      ) : myStatus === "CONFIRMED" ? (
        <button onClick={() => { sfx.click(); setShowCancel(true); }} disabled={loading} className="btn-danger w-full py-3 no-tap">
          {t("lobby.cantMake")}
        </button>
      ) : (
        <button onClick={() => { sfx.click(); setShowCancel(true); }} disabled={loading} className="btn-ghost w-full py-3 no-tap">
          ברשימת המתנה · יציאה
        </button>
      )}

      {/* Cancel reason dialog */}
      <AnimatePresence>
        {showCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center"
            onClick={() => setShowCancel(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-md"
            >
              <h3 className="font-display text-lg font-bold">{t("lobby.cantTitle")}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {new Date(match.scheduledAt).getTime() - Date.now() < 3600000
                  ? "שים לב: פחות משעה לקומפ — הביטול יסומן כביטול מאוחר."
                  : "אפשר לבטל עד שעה לפני. ספרו לחברים למה 👇"}
              </p>
              <textarea
                className="input mt-3 min-h-[70px] resize-none"
                placeholder={t("lobby.cantReason")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
              />
              <div className="mt-3 flex gap-2">
                <button onClick={cancel} disabled={loading} className="btn-danger flex-1 no-tap">
                  {loading ? "..." : t("lobby.cantSubmit")}
                </button>
                <button onClick={() => setShowCancel(false)} className="btn-ghost no-tap">
                  {t("common.cancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
