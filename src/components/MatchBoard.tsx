"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { MatchCard } from "./MatchCard";
import { LogoMark } from "./Logo";
import type { MatchDTO } from "@/lib/types";

export function MatchBoard({
  matches,
  title,
  subtitle,
  showMore = false,
}: {
  matches: MatchDTO[];
  title?: string;
  subtitle?: string;
  showMore?: boolean;
}) {
  const { t } = useI18n();

  return (
    <section>
      {(title || showMore) && (
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">{title ?? t("board.title")}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          {showMore && (
            <Link href="/matches" onClick={() => sfx.soft()} className="btn-ghost text-sm no-tap">
              {t("nav.matches")} ←
            </Link>
          )}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-12 text-center">
          <div className="opacity-40">
            <LogoMark size={56} />
          </div>
          <p className="max-w-xs text-slate-400">{t("board.empty")}</p>
          <Link href="/create" onClick={() => sfx.click()} className="btn-primary no-tap">
            {t("hero.cta.secondary")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
