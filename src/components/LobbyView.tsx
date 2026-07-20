"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMatchTime, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { GameLogo } from "./GameLogo";
import { Avatar } from "./Avatar";
import { Countdown } from "./Countdown";
import { StatusBadge, matchStatusInfo } from "./StatusBadge";
import { CompActions } from "./CompActions";
import { ShareBar } from "./ShareBar";
import { ChatBox } from "./ChatBox";
import { PostMatchForm } from "./PostMatchForm";
import type { MatchDTO } from "@/lib/types";

export function LobbyView({ match }: { match: MatchDTO }) {
  const { t } = useI18n();
  const ended = matchStatusInfo(match).label === "הסתיים" || match.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <Link href="/matches" onClick={() => sfx.soft()} className="text-sm text-slate-400 hover:text-white no-tap">
        ← {t("lobby.back")}
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
              <GameLogo game={match.game} size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge match={match} />
                {match.isPrivate && <span className="chip bg-white/10 text-slate-300">🔒 פרטי</span>}
              </div>
              <h1 className="mt-1.5 font-display text-2xl font-black md:text-3xl">{match.title}</h1>
              <p className="mt-1 text-slate-300">{formatMatchTime(match.scheduledAt)}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t("board.hostedBy")} {match.creatorName}</p>
              {match.notes && <p className="mt-3 max-w-lg rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-slate-300">{match.notes}</p>}
            </div>
          </div>
          {!ended && (
            <div className="rounded-2xl bg-white/[0.03] px-4 py-3 text-center">
              <p className="mb-1 text-xs text-slate-400">{t("board.starts")}</p>
              <Countdown to={match.scheduledAt} />
            </div>
          )}
        </div>

        <div className="mt-5">
          <CompActions match={match} full />
        </div>
      </motion.div>

      <ShareBar match={match} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Participants */}
        <div className="space-y-4">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-bold">{t("lobby.confirmed")}</h3>
              <span className="text-sm font-bold">
                <span className="text-brand-400">{match.confirmed.length}</span>
                <span className="text-slate-500"> / {match.capacity}</span>
              </span>
            </div>
            <div className="space-y-2">
              {match.confirmed.length === 0 && <p className="text-sm text-slate-500">אין עדיין נרשמים.</p>}
              {match.confirmed.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2">
                  <span className="w-4 text-xs text-slate-500">{i + 1}</span>
                  <Avatar name={p.displayName ?? p.username} color={p.avatarColor} src={p.avatarUrl} size={30} />
                  <span className="font-semibold">{p.displayName ?? p.username}</span>
                  {p.userId === match.creatorId && <span className="chip bg-brand-500/15 text-brand-300 text-[10px]">מארח</span>}
                </div>
              ))}
              {/* empty seats */}
              {Array.from({ length: Math.max(0, match.capacity - match.confirmed.length) }).map((_, i) => (
                <div key={`e${i}`} className="flex items-center gap-2.5 rounded-xl border border-dashed border-white/10 px-3 py-2 text-slate-600">
                  <span className="w-4 text-xs">{match.confirmed.length + i + 1}</span>
                  <span className="text-sm">מקום פנוי</span>
                </div>
              ))}
            </div>
          </div>

          {match.waitlist.length > 0 && (
            <div className="card">
              <h3 className="mb-3 font-display font-bold">רשימת המתנה</h3>
              <div className="space-y-2">
                {match.waitlist.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2">
                    <span className="w-4 text-xs text-slate-500">{i + 1}</span>
                    <Avatar name={p.displayName ?? p.username} color={p.avatarColor} src={p.avatarUrl} size={28} />
                    <span className="text-sm font-semibold text-slate-300">{p.displayName ?? p.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {match.cancelled.length > 0 && (
            <div className="card">
              <h3 className="mb-3 font-display font-bold text-slate-400">{t("lobby.out")}</h3>
              <div className="space-y-2">
                {match.cancelled.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Avatar name={p.displayName ?? p.username} color={p.avatarColor} src={p.avatarUrl} size={24} />
                    <span className="line-through">{p.displayName ?? p.username}</span>
                    {p.outLate && <span className="chip bg-red-500/10 text-red-300 text-[10px]">מאוחר</span>}
                    {p.outReason && <span className="truncate">— {p.outReason}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ended && <PostMatchForm match={match} />}
        </div>

        {/* Chat */}
        <ChatBox matchId={match.id} />
      </div>
    </div>
  );
}
