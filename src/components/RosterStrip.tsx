"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";

interface P { id: string; username: string; displayName: string | null; avatarColor: string; isCaptain: boolean }

export function RosterStrip({ players }: { players: P[] }) {
  const { t } = useI18n();
  if (!players.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-bold md:text-3xl">הצוות</h2>
        <Link href="/players" onClick={() => sfx.soft()} className="btn-ghost text-sm no-tap">
          {t("nav.players")} ←
        </Link>
      </div>
      <div className="hide-scroll flex gap-3 overflow-x-auto pb-2">
        {players.slice(0, 12).map((p) => (
          <Link
            key={p.id}
            href="/players"
            onClick={() => sfx.soft()}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 no-tap"
          >
            <Avatar name={p.displayName ?? p.username} color={p.avatarColor} size={52} ring={p.isCaptain} />
            <span className="w-full truncate text-center text-[11px] text-slate-400">{p.displayName ?? p.username}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
