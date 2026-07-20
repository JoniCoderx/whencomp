"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { GAME_LIST } from "@/lib/games";
import { MatchCard } from "./MatchCard";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";
import type { MatchDTO } from "@/lib/types";

export function MatchBoard({
  matches,
  showFilter = false,
  compact = false,
}: {
  matches: MatchDTO[];
  showFilter?: boolean;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? matches : matches.filter((m) => m.game === filter)),
    [matches, filter]
  );

  return (
    <section className={compact ? "" : "mt-4"}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">{t("board.title")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("board.subtitle")}</p>
        </div>
        {compact && (
          <Link href="/matches" onClick={() => sfx.soft()} className="btn-ghost text-sm no-tap">
            {t("nav.matches")} →
          </Link>
        )}
      </div>

      {showFilter && (
        <div className="mb-5 flex flex-wrap gap-2">
          {["ALL", ...GAME_LIST.map((g) => g.key)].map((g) => (
            <button
              key={g}
              onClick={() => {
                sfx.click();
                setFilter(g);
              }}
              className={cn(
                "chip border no-tap transition",
                filter === g
                  ? "border-neon-purple/50 bg-neon-purple/15 text-neon-violet"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              )}
            >
              {g === "ALL" ? "All" : g}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card text-center text-slate-400">{t("board.empty")}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
