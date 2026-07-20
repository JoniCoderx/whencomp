"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { eloTier } from "@/lib/elo";
import { Avatar } from "./Avatar";

interface Row {
  id: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  elo: number;
  mvpCount: number;
  matchesPlayed: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardView({ rows }: { rows: Row[] }) {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">{t("leaderboard.title")}</h1>
      <p className="mt-1 text-slate-400">{t("leaderboard.subtitle")}</p>

      <div className="mt-6 space-y-2">
        {rows.map((r, i) => {
          const tier = eloTier(r.elo);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card flex items-center gap-3 !py-3"
            >
              <div className="w-8 text-center font-display text-lg font-bold">
                {MEDALS[i] ?? <span className="text-slate-500">{i + 1}</span>}
              </div>
              <Avatar name={r.displayName ?? r.username} color={r.avatarColor} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.displayName ?? r.username}</p>
                <p className="text-xs" style={{ color: tier.color }}>
                  {tier.name} · ⭐ {r.mvpCount} · {r.matchesPlayed} {t("board.players")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-neon-electric">{r.elo}</p>
                <p className="text-[10px] uppercase text-slate-500">{t("profile.elo")}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
