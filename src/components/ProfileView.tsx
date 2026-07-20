"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMatchTime, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";
import type { ProfileDTO } from "@/lib/types";
import type { AttendanceStats, Reliability } from "@/lib/reliability";

interface HistoryItem { match: any; status: string; outLate: boolean }

export function ProfileView({ user, upcoming, history, stats, reliability }: {
  user: ProfileDTO; upcoming: any[]; history: HistoryItem[]; stats: AttendanceStats; reliability: Reliability;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName ?? user.username);
  const [steam, setSteam] = useState(user.steamProfile ?? "");
  const [discord, setDiscord] = useState(user.discordName ?? "");
  const [avatar, setAvatar] = useState(user.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    sfx.click();
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, steamProfile: steam, discordName: discord, avatarUrl: avatar }),
    });
    setSaving(false);
    if (res.ok) { setEditing(false); router.refresh(); }
  }

  async function deleteAccount() {
    if (!confirm(t("profile.deleteConfirm"))) return;
    const res = await fetch("/api/profile", { method: "DELETE" });
    if (res.ok) { await signOut({ redirect: false }); router.push("/"); }
  }

  const statCells = [
    { label: t("profile.arrived"), value: stats.arrived, color: "text-emerald-400" },
    { label: t("profile.cancelledOnTime"), value: stats.cancelledOnTime, color: "text-slate-300" },
    { label: t("profile.cancelledLate"), value: stats.cancelledLate, color: "text-amber-400" },
    { label: t("profile.noShow"), value: stats.noShow, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={user.displayName ?? user.username} color={user.avatarColor} src={user.avatarUrl} size={64} ring />
          <div>
            <h1 className="font-display text-2xl font-black">{user.displayName ?? user.username}</h1>
            <p className="text-sm text-slate-400">@{user.username}{user.role === "ADMIN" && " · 👑 מנהל"}</p>
            <span className="chip mt-1.5" style={{ background: `${reliability.color}22`, color: reliability.color }}>{reliability.label}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { sfx.soft(); setEditing((v) => !v); }} className="btn-ghost text-sm no-tap">{t("profile.edit")}</button>
        </div>
      </motion.div>

      {editing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card space-y-3">
          <div><label className="label">{t("profile.displayName")}</label><input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} /></div>
          <div><label className="label">תמונת פרופיל (קישור)</label><input className="input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://... (קישור לתמונה)" /></div>
          <div><label className="label">{t("profile.steam")}</label><input className="input" value={steam} onChange={(e) => setSteam(e.target.value)} placeholder="https://steamcommunity.com/id/..." /></div>
          <div><label className="label">{t("profile.discord")}</label><input className="input" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="username#0000" /></div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary flex-1 no-tap">{saving ? "..." : t("common.save")}</button>
            <button onClick={deleteAccount} className="btn-danger no-tap">{t("profile.deleteAccount")}</button>
          </div>
        </motion.div>
      )}

      {/* Reliability + attendance */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display font-bold">{t("profile.reliability")}</h2>
          <span className="font-display text-lg font-black" style={{ color: reliability.color }}>{reliability.score}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${reliability.score}%`, background: reliability.color }} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {statCells.map((s) => (
            <div key={s.label} className="rounded-xl bg-white/[0.03] py-2 text-center">
              <p className={cn("font-display text-xl font-black", s.color)}>{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold">{t("profile.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <div className="card text-sm text-slate-400">{t("profile.noUpcoming")}</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m) => (
              <Link key={m.id} href={`/matches/${m.id}`} onClick={() => sfx.soft()} className="card flex items-center justify-between !py-3 no-tap">
                <span className="font-semibold">{m.title}</span>
                <span className="text-sm text-brand-400">{formatMatchTime(m.scheduledAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold">{t("profile.history")}</h2>
        {history.length === 0 ? (
          <div className="card text-sm text-slate-400">{t("profile.noHistory")}</div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 15).map((h) => (
              <div key={h.match.id} className="card flex items-center justify-between !py-3">
                <span className="text-sm">{h.match.title}</span>
                <span className={cn("chip text-[11px]", h.status === "OUT" ? "bg-white/5 text-slate-400" : "bg-emerald-500/10 text-emerald-300")}>
                  {h.status === "OUT" ? (h.outLate ? t("profile.cancelledLate") : t("profile.cancelledOnTime")) : t("profile.arrived")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
