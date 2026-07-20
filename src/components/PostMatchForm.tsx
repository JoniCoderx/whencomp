"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { generateSummary } from "@/lib/banter";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";
import { Avatar } from "./Avatar";
import type { MatchDTO } from "@/lib/types";

export function PostMatchForm({
  match,
  currentUserId,
}: {
  match: MatchDTO;
  currentUserId?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [mvp, setMvp] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const isParticipant = !!currentUserId && match.participants.some((p) => p.userId === currentUserId);
  const mvpName = match.participants.find((p) => p.userId === mvp)?.displayName ??
    match.participants.find((p) => p.userId === mvp)?.username ?? null;

  const summary = generateSummary({
    title: match.title,
    game: match.game,
    mvp: mvpName,
    players: match.participants.map((p) => p.displayName ?? p.username),
  });

  async function submit() {
    if (!isParticipant) {
      router.push("/login");
      return;
    }
    setLoading(true);
    sfx.success();
    try {
      await fetch(`/api/matches/${match.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mvpVoteId: mvp ?? undefined, fpsRating: fps || undefined }),
      });
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-5 border border-neon-purple/20">
      <h3 className="font-display text-lg font-bold">🏁 {t("post.title")}</h3>

      {/* AI-free summary (hardcoded templates) */}
      <div className="rounded-xl bg-white/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-neon-violet">
          {t("post.summary")}
        </p>
        <p className="text-sm text-slate-200">{summary}</p>
      </div>

      {done ? (
        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-neon-lime/10 p-4 text-center text-sm font-semibold text-neon-lime"
        >
          ✅ {t("post.thanks")}
        </motion.p>
      ) : (
        <>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-300">{t("post.mvp")}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {match.participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sfx.soft();
                    setMvp(p.userId);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition no-tap",
                    mvp === p.userId
                      ? "border-neon-purple/60 bg-neon-purple/15 shadow-neon-purple"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <Avatar name={p.displayName ?? p.username} color={p.avatarColor} size={24} />
                  <span className="truncate font-semibold">{p.displayName ?? p.username}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-300">{t("post.fps")}</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    sfx.click();
                    setFps(n);
                  }}
                  className={cn(
                    "grid h-11 flex-1 place-items-center rounded-xl border text-lg transition no-tap",
                    fps >= n
                      ? "border-neon-electric/50 bg-neon-electric/15 text-neon-electric"
                      : "border-white/10 bg-white/5 text-slate-500 hover:bg-white/10"
                  )}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading || (!mvp && !fps)}
            className="btn-primary w-full py-3 no-tap disabled:opacity-50"
          >
            {loading ? "…" : t("post.submit")}
          </button>
        </>
      )}
    </div>
  );
}
