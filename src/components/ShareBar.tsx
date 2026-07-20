"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { buildShareText, whatsappLink, downloadIcs, nativeShare } from "@/lib/share";
import { sfx } from "@/lib/sound";
import type { MatchDTO } from "@/lib/types";

export function ShareBar({ match }: { match: MatchDTO }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/matches/${match.id}`
      : `/matches/${match.id}`;

  const shareMatch = {
    title: match.title,
    game: match.game,
    scheduledAt: match.scheduledAt,
    url,
    discordLink: match.discordLink,
  };

  async function onShare() {
    sfx.click();
    const ok = await nativeShare(shareMatch);
    if (!ok) {
      // Fallback: copy the share text.
      await navigator.clipboard.writeText(buildShareText(shareMatch));
      flashCopied();
    }
  }

  function flashCopied() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function onCopy() {
    sfx.soft();
    await navigator.clipboard.writeText(url);
    flashCopied();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onShare} className="btn-ghost text-sm no-tap">
        📤 {t("lobby.share")}
      </button>
      <a
        href={whatsappLink(buildShareText(shareMatch))}
        target="_blank"
        rel="noreferrer"
        onClick={() => sfx.soft()}
        className="btn-ghost text-sm no-tap"
      >
        💬 {t("lobby.whatsapp")}
      </a>
      <button
        onClick={() => {
          sfx.soft();
          downloadIcs(shareMatch);
        }}
        className="btn-ghost text-sm no-tap"
      >
        🗓️ {t("lobby.calendar")}
      </button>
      {match.discordLink && (
        <a
          href={match.discordLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => sfx.soft()}
          className="btn-ghost text-sm no-tap"
        >
          🎧 {t("lobby.discord")}
        </a>
      )}
      <button onClick={onCopy} className="btn-ghost text-sm no-tap">
        {copied ? `✅ ${t("lobby.copied")}` : `🔗 ${t("lobby.copy")}`}
      </button>
    </div>
  );
}
