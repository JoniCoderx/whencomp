"use client";

import { useMemo } from "react";
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
import { ShareBar } from "./ShareBar";
import { BanterBox } from "./BanterBox";
import { PostMatchForm } from "./PostMatchForm";
import type { MatchDTO } from "@/lib/types";

function TeamColumn({
  label,
  color,
  players,
}: {
  label: string;
  color: string;
  players: MatchDTO["participants"];
}) {
  return (
    <div className="flex-1 rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <h4 className="font-display text-sm font-bold uppercase tracking-wide">{label}</h4>
        <span className="ml-auto text-xs text-slate-500">{players.length}</span>
      </div>
      <div className="space-y-2">
        {players.length === 0 && <p className="text-xs text-slate-600">—</p>}
        {players.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-xl bg-base-900/40 px-2 py-1.5"
          >
            <Avatar name={p.displayName ?? p.username} color={p.avatarColor} size={28} />
            <span className="truncate text-sm font-semibold">{p.displayName ?? p.username}</span>
            <span className="ml-auto text-xs text-slate-500">{p.elo}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function LobbyView({ match }: { match: MatchDTO }) {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const meta = gameMeta(match.game);
  const userId = (session?.user as any)?.id;
  const joined = !!userId && match.participants.some((p) => p.userId === userId);
  const full = match.participants.length >= match.maxPlayers;

  const isPast = useMemo(
    () => new Date(match.scheduledAt).getTime() < Date.now() || match.status === "COMPLETED",
    [match.scheduledAt, match.status]
  );

  const teamA = match.participants.filter((p) => p.team === "A");
  const teamB = match.participants.filter((p) => p.team === "B");
  const unassigned = match.participants.filter((p) => p.team === "UNASSIGNED");

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
    <div className="space-y-6">
      <Link href="/matches" onClick={() => sfx.soft()} className="text-sm text-slate-400 hover:text-white no-tap">
        ← {t("nav.matches")}
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("card relative overflow-hidden bg-gradient-to-br", meta.gradient)}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className={cn("chip bg-white/5", meta.accent)}>
              <span>{meta.emoji}</span>
              {meta.label}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold">{match.title}</h1>
            <p className="mt-1 text-slate-300">{formatMatchTime(match.scheduledAt, locale)}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {t("board.hostedBy")} {match.creatorName}
            </p>
            {match.notes && <p className="mt-3 max-w-lg text-sm text-slate-300">{match.notes}</p>}
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold">
              {match.participants.length}
              <span className="text-slate-500">/{match.maxPlayers}</span>
            </div>
            <p className="text-xs text-slate-500">{t("board.players")}</p>
          </div>
        </div>

        {!isPast && (
          <div className="mt-5">
            <button
              onClick={toggleJoin}
              disabled={loading || (full && !joined)}
              className={cn(
                "w-full py-3 text-base no-tap sm:w-auto sm:px-10",
                joined ? "btn-ghost" : "btn-primary",
                full && !joined && "opacity-50"
              )}
            >
              {loading ? "…" : joined ? t("board.leave") : full ? t("board.full") : t("board.join")}
            </button>
          </div>
        )}
      </motion.div>

      <ShareBar match={match} />

      {!isPast && <BanterBox match={match} />}

      {/* Teams */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold">Teams</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <TeamColumn label={t("lobby.teamA")} color="#3b82f6" players={teamA} />
          <TeamColumn label={t("lobby.teamB")} color="#ec4899" players={teamB} />
        </div>
        {unassigned.length > 0 && (
          <div className="mt-3">
            <TeamColumn label={t("lobby.unassigned")} color="#64748b" players={unassigned} />
          </div>
        )}
      </div>

      {isPast && <PostMatchForm match={match} currentUserId={userId} />}
    </div>
  );
}
