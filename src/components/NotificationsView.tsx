"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { formatFullDate } from "@/lib/format";
import { sfx } from "@/lib/sound";
import type { NotificationDTO } from "@/lib/types";

const ICONS: Record<string, string> = {
  FULL: "🔒", SPOT_OPEN: "🎉", STARTING: "⏰", CHANGED: "✏️", CANCELLED: "❌", CHAT: "💬", SYSTEM: "📢", JOINED: "✅",
};

export function NotificationsView() {
  const { t } = useI18n();
  const [items, setItems] = useState<NotificationDTO[] | null>(null);
  const [perm, setPerm] = useState<string>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
    fetch("/api/notifications").then((r) => r.json()).then((d) => setItems(d.items ?? []));
    // mark all read on view
    fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
  }, []);

  async function enableNotifs() {
    if (typeof Notification === "undefined") return;
    sfx.click();
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") new Notification("WHEN COMP", { body: "התראות מופעלות! נעדכן אותך על הקומפים." });
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{t("notif.title")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("notif.subtitle")}</p>
        </div>
        {perm !== "granted" && (
          <button onClick={enableNotifs} className="btn-ghost text-sm no-tap">🔔 {t("notif.enable")}</button>
        )}
      </div>

      {items === null ? (
        <div className="card animate-pulse py-10 text-center text-slate-500">{t("common.loading")}</div>
      ) : items.length === 0 ? (
        <div className="card py-12 text-center text-slate-400">{t("notif.empty")}</div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const inner = (
              <div className={`card flex items-start gap-3 !py-3 ${!n.read ? "border-r-2 border-r-brand-500" : ""}`}>
                <span className="text-xl">{ICONS[n.kind] ?? "🔔"}</span>
                <div className="flex-1">
                  <p className="text-sm">{n.body}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatFullDate(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />}
              </div>
            );
            return n.matchId ? (
              <Link key={n.id} href={`/matches/${n.matchId}`} onClick={() => sfx.soft()} className="block">{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
