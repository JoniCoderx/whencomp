"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useI18n } from "@/i18n/I18nProvider";
import { gameMeta } from "@/lib/games";
import { formatMatchTime, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";
import type { MatchDTO } from "@/lib/types";

export function MatchCard({ match, index = 0 }: { match: MatchDTO; index?: number }) {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const meta = gameMeta(match.game);
  const userId = (session?.user as any)?.id;
  const joined = !!userId && match.participants.some((p) => p.userId === userId);
  const full = match.participants.length >= match.maxPlayers;

  async function toggleJoin() {
    if (!userId) {
      router.push("/login");
      return;
    }
    setLoading(true);
    joined ? sfx.soft() : sfx.join();
    try {
      const res = await fetch(`/api/matches/${match.id}/join`, {
        method: joined ? "DELETE" : "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), type: "spring", stiffness: 120, damping: 18 }}
      whileHover={{ y: -4 }}
      className={cn(
        "card group relative overflow-hidden bg-gradient-to-br",
        meta.gradient
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl", meta.glow)} />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <span className={cn("chip bg-white/5", meta.accent)}>
            <span>{meta.emoji}</span>
            {match.game}
          </span>
          <Link href={`/matches/${match.id}`}>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight hover:text-neon-purple transition">
              {match.title}
            </h3>
          </Link>
          <p className="mt-0.5 text-sm text-slate-400">
            {formatMatchTime(match.scheduledAt, locale)}
          </p>
        </div>
        {match.status !== "UPCOMING" && (
          <span className="chip bg-white/5 text-slate-300 text-[10px] uppercase">
            {match.status}
          </span>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {match.participants.slice(0, 5).map((p) => (
            <div key={p.id} className="ring-2 ring-base-900 rounded-full">
              <Avatar name={p.displayName ?? p.username} color={p.avatarColor} size={30} />
            </div>
          ))}
          {match.participants.length > 5 && (
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-base-700 text-[11px] font-bold ring-2 ring-base-900">
              +{match.participants.length - 5}
            </span>
          )}
          {match.participants.length === 0 && (
            <span className="text-xs text-slate-500">—</span>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {match.participants.length}/{match.maxPlayers} {t("board.players")}
        </span>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <button
          disabled={loading || (full && !joined)}
          onClick={toggleJoin}
          className={cn(
            "flex-1 no-tap",
            joined ? "btn-ghost" : "btn-primary",
            (full && !joined) && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading
            ? "…"
            : joined
            ? t("board.leave")
            : full
            ? t("board.full")
            : t("board.join")}
        </button>
        <Link href={`/matches/${match.id}`} onClick={() => sfx.soft()} className="btn-ghost no-tap">
          {t("board.view")}
        </Link>
      </div>
    </motion.div>
  );
}
