"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  avatarUrl: string | null;
  role: string;
  steamProfile: string | null;
  discordName: string | null;
  matchesPlayed: number;
  isCaptain: boolean;
  votes: number;
  votedByMe: boolean;
  reliability: { label: string; color: string; score: number };
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function PlayersView({ players: initial }: { players: Player[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [players, setPlayers] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function vote(p: Player) {
    if (!userId) return router.push("/login");
    if (p.id === userId) return;
    setBusy(p.id);
    p.votedByMe ? sfx.soft() : sfx.join();
    try {
      const res = await fetch(`/api/players/${p.id}/vote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPlayers((prev) =>
          [...prev.map((x) => (x.id === p.id ? { ...x, votes: data.count, votedByMe: data.voted } : x))].sort(
            (a, b) => b.votes - a.votes || b.matchesPlayed - a.matchesPlayed || (a.isCaptain ? -1 : 1)
          )
        );
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold md:text-3xl">🏆 טבלת השחקנים</h1>
        <p className="mt-1 text-sm text-slate-400">הצביעו לשחקנים הכי טובים — הכי מוצבעים בראש.</p>
      </div>

      <div className="space-y-2.5">
        {players.map((p, i) => {
          const mine = p.id === userId;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.25) }}
              className={cn(
                "card flex items-center gap-3",
                p.isCaptain && "border border-brand-500/40 bg-brand-500/[0.04]"
              )}
            >
              <div className="w-7 shrink-0 text-center font-display text-lg font-black">
                {MEDALS[i] ?? <span className="text-slate-500">{i + 1}</span>}
              </div>
              <Avatar name={p.displayName ?? p.username} color={p.avatarColor} src={p.avatarUrl} size={46} ring={p.isCaptain} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-display font-bold">{p.displayName ?? p.username}</p>
                  {p.isCaptain && <span className="chip bg-brand-500/20 text-brand-300 text-[10px]">קפטן</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span style={{ color: p.reliability.color }}>{p.reliability.label}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500">{p.matchesPlayed} קומפים</span>
                  {p.steamProfile && (
                    <a href={p.steamProfile} target="_blank" rel="noreferrer" onClick={() => sfx.soft()} className="text-brand-400 hover:underline no-tap">
                      Steam ↗
                    </a>
                  )}
                </div>
              </div>
              {/* Vote */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <button
                  onClick={() => vote(p)}
                  disabled={busy === p.id || mine}
                  title={mine ? "אי אפשר להצביע לעצמך" : "הצבעה"}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-xl border text-lg transition no-tap",
                    mine && "opacity-30",
                    p.votedByMe
                      ? "border-brand-500/60 bg-brand-500/20 text-brand-300"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  {p.votedByMe ? "★" : "☆"}
                </button>
                <span className="font-display text-sm font-black tabular-nums text-brand-400">{p.votes}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!userId && (
        <p className="mt-4 text-center text-sm text-slate-500">התחברו כדי להצביע לשחקנים.</p>
      )}
    </div>
  );
}
