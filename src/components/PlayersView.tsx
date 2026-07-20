"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";

interface Player {
  id: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  role: string;
  steamProfile: string | null;
  discordName: string | null;
  matchesPlayed: number;
  isCaptain: boolean;
  reliability: { label: string; color: string; score: number };
}

export function PlayersView({ players }: { players: Player[] }) {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold md:text-3xl">הצוות</h1>
        <p className="mt-1 text-sm text-slate-400">השחקנים שלנו — בחרו את מי לצרף לקומפ הבא.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className={cn(
              "card flex items-center gap-3",
              p.isCaptain && "border border-brand-500/40 bg-brand-500/[0.04]"
            )}
          >
            <Avatar name={p.displayName ?? p.username} color={p.avatarColor} size={52} ring={p.isCaptain} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-display font-bold">{p.displayName ?? p.username}</p>
                {p.isCaptain && <span className="chip bg-brand-500/20 text-brand-300 text-[10px]">קפטן</span>}
                {p.role === "ADMIN" && !p.isCaptain && <span className="chip bg-white/10 text-slate-300 text-[10px]">מנהל</span>}
              </div>
              <p className="text-xs" style={{ color: p.reliability.color }}>
                {p.reliability.label} · {p.matchesPlayed} קומפים
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.steamProfile && (
                  <a
                    href={p.steamProfile}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sfx.soft()}
                    className="chip border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 no-tap"
                  >
                    Steam ↗
                  </a>
                )}
                {p.discordName && <span className="chip border border-white/10 bg-white/5 text-slate-400">{p.discordName}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
