"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { generateSummary } from "@/lib/banter";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";
import { Avatar } from "./Avatar";
import type { MatchDTO } from "@/lib/types";

export function PostMatchForm({ match }: { match: MatchDTO }) {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const isParticipant = match.confirmed.some((p) => p.userId === userId);

  const [rating, setRating] = useState(0);
  const [mvp, setMvp] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const mvpName = match.confirmed.find((p) => p.userId === mvp)?.displayName ??
    match.confirmed.find((p) => p.userId === mvp)?.username ?? null;
  const summary = generateSummary({ title: match.title, game: match.game, mvp: mvpName, players: match.confirmed.map((p) => p.username) });

  async function submit() {
    setLoading(true);
    sfx.success();
    try {
      const res = await fetch(`/api/matches/${match.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: rating || undefined, mvpVoteId: mvp ?? undefined, note, happened: true }),
      });
      if (res.ok) { setDone(true); router.refresh(); }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-4 border border-brand-500/20">
      <h3 className="font-display text-lg font-bold">🏁 {t("post.title")}</h3>
      <div className="rounded-xl bg-white/[0.03] p-3">
        <p className="mb-1 text-xs font-bold text-brand-300">{t("post.summary")}</p>
        <p className="text-sm text-slate-200">{summary}</p>
      </div>

      {!isParticipant ? (
        <p className="text-sm text-slate-500">רק משתתפים יכולים למלא משוב.</p>
      ) : done ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-300">
          ✅ {t("post.thanks")}
        </motion.p>
      ) : (
        <>
          <div>
            <p className="label">{t("post.rate")}</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => { sfx.click(); setRating(n); }} className={cn("grid h-11 flex-1 place-items-center rounded-xl border text-lg no-tap", rating >= n ? "border-brand-500/50 bg-brand-500/15 text-brand-400" : "border-white/10 bg-white/5 text-slate-500")}>★</button>
              ))}
            </div>
          </div>
          <div>
            <p className="label">{t("post.mvp")}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {match.confirmed.map((p) => (
                <button key={p.id} onClick={() => { sfx.soft(); setMvp(p.userId); }} className={cn("flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm no-tap", mvp === p.userId ? "border-brand-500/60 bg-brand-500/15" : "border-white/10 bg-white/5")}>
                  <Avatar name={p.displayName ?? p.username} color={p.avatarColor} size={22} />
                  <span className="truncate font-semibold">{p.displayName ?? p.username}</span>
                </button>
              ))}
            </div>
          </div>
          <textarea className="input min-h-[60px] resize-none" placeholder="הערה (לא חובה)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} />
          <button onClick={submit} disabled={loading || (!rating && !mvp)} className="btn-primary w-full py-3 no-tap disabled:opacity-50">
            {loading ? "..." : t("post.submit")}
          </button>
        </>
      )}
    </div>
  );
}
