"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { eloTier } from "@/lib/elo";
import { Avatar } from "./Avatar";
import { TrophyCard } from "./TrophyCard";
import type { Trophy } from "@/lib/queries";
import type { ProfileDTO } from "@/lib/types";

interface Nemesis {
  id: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  elo: number;
  encounters: number;
}

export function ProfileView({
  user,
  trophies,
  nemesis,
}: {
  user: ProfileDTO;
  trophies: Trophy[];
  nemesis: Nemesis | null;
}) {
  const { t } = useI18n();
  const tier = eloTier(user.elo);

  const stats = [
    { label: t("profile.elo"), value: user.elo, color: "text-neon-electric" },
    { label: t("profile.mvp"), value: user.mvpCount, color: "text-neon-purple" },
    { label: t("profile.played"), value: user.matchesPlayed, color: "text-neon-lime" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-4"
      >
        <Avatar name={user.displayName ?? user.username} color={user.avatarColor} size={72} ring />
        <div>
          <h1 className="font-display text-2xl font-bold">{user.displayName ?? user.username}</h1>
          <span
            className="chip mt-1 font-bold"
            style={{ background: `${tier.color}22`, color: tier.color }}
          >
            {tier.name}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card text-center"
          >
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Nemesis */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold">😈 {t("profile.nemesis")}</h2>
        {nemesis ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card flex items-center gap-4 border border-neon-pink/20"
          >
            <Avatar name={nemesis.displayName ?? nemesis.username} color={nemesis.avatarColor} size={52} />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">{nemesis.displayName ?? nemesis.username}</p>
              <p className="text-sm text-slate-400">
                Faced {nemesis.encounters}× · {nemesis.elo} Elo
              </p>
            </div>
            <span className="text-3xl">⚔️</span>
          </motion.div>
        ) : (
          <div className="card text-sm text-slate-400">{t("profile.nemesis.none")}</div>
        )}
      </div>

      {/* Trophy Room */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold">🏆 {t("profile.trophies")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {trophies.map((tr) => (
            <TrophyCard key={tr.key} trophy={tr} />
          ))}
        </div>
      </div>
    </div>
  );
}
