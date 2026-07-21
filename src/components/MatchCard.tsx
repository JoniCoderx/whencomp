"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMatchTime, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { buildShareText, whatsappLink, type ShareMatch } from "@/lib/share";
import { Avatar } from "./Avatar";
import { CalendarButton } from "./CalendarButton";
import { GameLogo } from "./GameLogo";
import { Countdown } from "./Countdown";
import { StatusBadge } from "./StatusBadge";
import { CompActions } from "./CompActions";
import type { MatchDTO } from "@/lib/types";

export function MatchCard({ match, index = 0 }: { match: MatchDTO; index?: number }) {
  const { t } = useI18n();
  const spots = match.confirmed.length;

  const sm: ShareMatch = {
    title: match.title,
    scheduledAt: match.scheduledAt,
    url: typeof window !== "undefined" ? `${window.location.origin}/matches/${match.id}` : `/matches/${match.id}`,
    confirmed: spots,
    capacity: match.capacity,
    discordLink: match.discordLink,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.35) }}
      className={cn("card flex flex-col gap-4", match.game === "CS2" && "cs2-tactical")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5">
            <GameLogo game={match.game} size={26} />
          </div>
          <div>
            <Link href={`/matches/${match.id}`} onClick={() => sfx.soft()}>
              <h3 className="font-display text-lg font-bold leading-tight hover:text-brand-400">{match.title}</h3>
            </Link>
            <p className="text-sm text-slate-400">{formatMatchTime(match.scheduledAt)}</p>
          </div>
        </div>
        <StatusBadge match={match} />
      </div>

      <div className="flex items-center justify-center rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
        <Countdown to={match.scheduledAt} text />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2 space-x-reverse">
          {match.confirmed.slice(0, 5).map((p) => (
            <div key={p.id} className="rounded-full ring-2 ring-ink-850">
              <Avatar name={p.displayName ?? p.username} color={p.avatarColor} src={p.avatarUrl} size={30} />
            </div>
          ))}
          {spots === 0 && <span className="text-xs text-slate-500">אין עדיין נרשמים</span>}
        </div>
        <span className="text-sm font-bold">
          <span className={cn(spots >= match.capacity ? "text-slate-400" : "text-brand-400")}>{spots}</span>
          <span className="text-slate-500"> / {match.capacity}</span>
        </span>
      </div>

      <CompActions match={match} />

      <div className="flex items-center gap-2 border-t border-white/5 pt-3">
        <Link href={`/matches/${match.id}`} onClick={() => sfx.soft()} className="btn-ghost flex-1 !py-2 text-sm no-tap">
          {t("board.view")}
        </Link>
        <a href={whatsappLink(buildShareText(sm))} target="_blank" rel="noreferrer" onClick={() => sfx.soft()} className="btn-ghost !px-3 !py-2 text-sm no-tap" title="WhatsApp">
          📲
        </a>
        <CalendarButton matchId={match.id} share={sm} compact />
      </div>
    </motion.div>
  );
}
