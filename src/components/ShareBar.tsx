"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { buildShareText, whatsappLink, nativeShare, type ShareMatch } from "@/lib/share";
import { sfx } from "@/lib/sound";
import { CalendarButton } from "./CalendarButton";
import type { MatchDTO } from "@/lib/types";

export function ShareBar({ match }: { match: MatchDTO }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/matches/${match.id}` : `/matches/${match.id}`;
  const sm: ShareMatch = {
    title: match.title,
    scheduledAt: match.scheduledAt,
    url,
    confirmed: match.confirmed.length,
    capacity: match.capacity,
    discordLink: match.discordLink,
  };

  function flash() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={whatsappLink(buildShareText(sm))} target="_blank" rel="noreferrer" onClick={() => sfx.soft()} className="btn-success text-sm no-tap">
        <span>📲</span> {t("lobby.whatsapp")}
      </a>
      <CalendarButton matchId={match.id} share={sm} />
      <button
        onClick={async () => { sfx.click(); const ok = await nativeShare(sm); if (!ok) { await navigator.clipboard.writeText(url); flash(); } }}
        className="btn-ghost text-sm no-tap"
      >
        <span>🔗</span> {copied ? t("lobby.copied") : t("lobby.share")}
      </button>
      {match.discordLink && (
        <a href={match.discordLink} target="_blank" rel="noreferrer" onClick={() => sfx.soft()} className="btn-ghost text-sm no-tap">
          <span>🎧</span> {t("lobby.discord")}
        </a>
      )}
    </div>
  );
}
