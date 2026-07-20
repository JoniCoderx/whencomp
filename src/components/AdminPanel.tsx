"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMatchTime, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";

type Tab = "stats" | "users" | "matches" | "cancels" | "broadcast";

export function AdminPanel() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [users, setUsers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [cancels, setCancels] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [broadcast, setBroadcast] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [u, m, s, c] = await Promise.all([
      fetch("/api/admin/users").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/matches").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/cancellations").then((r) => (r.ok ? r.json() : [])),
    ]);
    setUsers(u); setMatches(m); setStats(s); setCancels(c);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function patchUser(userId: string, body: any) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...body }) });
    sfx.click(); load();
  }
  async function deleteUser(userId: string, name: string) {
    if (!confirm(`למחוק את ${name}? פעולה בלתי הפיכה.`)) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    load();
  }
  async function cancelMatch(matchId: string) {
    if (!confirm("לבטל את הקומפ? כל המשתתפים יקבלו התראה.")) return;
    await fetch("/api/admin/matches", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId, action: "cancel" }) });
    load();
  }
  async function deleteMatch(matchId: string) {
    if (!confirm("למחוק את הקומפ לצמיתות?")) return;
    await fetch("/api/admin/matches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId }) });
    load();
  }
  async function sendBroadcast() {
    if (broadcast.trim().length < 2) return;
    if (!confirm("לשלוח הודעת מערכת לכל המשתמשים?")) return;
    const res = await fetch("/api/admin/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: broadcast }) });
    if (res.ok) { setMsg("ההודעה נשלחה ✅"); setBroadcast(""); setTimeout(() => setMsg(null), 2500); }
  }

  const filtered = users.filter((u) => u.username.toLowerCase().includes(q.toLowerCase()) || (u.displayName ?? "").toLowerCase().includes(q.toLowerCase()));

  const tabs: { key: Tab; label: string }[] = [
    { key: "stats", label: "נתונים" },
    { key: "users", label: "משתמשים" },
    { key: "matches", label: "קומפים" },
    { key: "cancels", label: "ביטולים" },
    { key: "broadcast", label: "הודעה כללית" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{t("admin.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("admin.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => { sfx.soft(); setTab(tb.key); }} className={cn("chip border no-tap", tab === tb.key ? "border-brand-500/50 bg-brand-500/15 text-brand-300" : "border-white/10 bg-white/5 text-slate-300")}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { l: "משתמשים", v: stats.users }, { l: "פעילים", v: stats.activeUsers }, { l: "קומפים קרובים", v: stats.upcoming },
            { l: "קומפים שהסתיימו", v: stats.completed }, { l: "ביטולים", v: stats.allCancels }, { l: "ביטולים מאוחרים", v: stats.lateCancels },
          ].map((s) => (
            <div key={s.l} className="card text-center">
              <p className="font-display text-3xl font-black text-brand-400">{s.v}</p>
              <p className="mt-1 text-xs text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          <input className="input" placeholder="חיפוש משתמש..." value={q} onChange={(e) => setQ(e.target.value)} />
          {filtered.map((u) => (
            <div key={u.id} className="card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Avatar name={u.displayName ?? u.username} color={u.avatarColor} size={38} />
                  <div>
                    <p className="font-bold">{u.displayName ?? u.username} {u.role === "ADMIN" && "👑"}</p>
                    <p className="text-xs" style={{ color: u.reliability.color }}>{u.reliability.label} · {u.stats.arrived} הגיע · {u.stats.cancelledLate} מאוחר</p>
                  </div>
                </div>
                <span className={cn("chip text-[10px]", u.status === "BANNED" ? "bg-red-500/15 text-red-300" : "bg-emerald-500/10 text-emerald-300")}>
                  {u.status === "BANNED" ? t("admin.banned") : t("admin.active")}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button onClick={() => patchUser(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })} className="btn-ghost !px-2.5 !py-1 text-xs no-tap">{u.role === "ADMIN" ? t("admin.removeAdmin") : t("admin.makeAdmin")}</button>
                <button onClick={() => patchUser(u.id, { status: u.status === "BANNED" ? "ACTIVE" : "BANNED" })} className="btn-ghost !px-2.5 !py-1 text-xs no-tap">{u.status === "BANNED" ? t("admin.unban") : t("admin.ban")}</button>
                <button onClick={() => patchUser(u.id, { chatBanned: !u.chatBanned })} className="btn-ghost !px-2.5 !py-1 text-xs no-tap">{u.chatBanned ? "ביטול השתקה" : "השתקת צ׳אט"}</button>
                <button onClick={() => patchUser(u.id, { suspendDays: 7 })} className="btn-ghost !px-2.5 !py-1 text-xs no-tap">השעיה שבוע</button>
                <button onClick={() => deleteUser(u.id, u.username)} className="btn-danger !px-2.5 !py-1 text-xs no-tap">{t("admin.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "matches" && (
        <div className="space-y-2">
          {matches.map((m) => (
            <div key={m.id} className="card flex flex-wrap items-center justify-between gap-2 !py-3">
              <div>
                <p className="font-bold">{m.title} <span className="text-xs text-slate-500">· {m.status}</span></p>
                <p className="text-xs text-slate-400">{formatMatchTime(m.scheduledAt)} · {m.confirmed.length}/{m.capacity}</p>
              </div>
              <div className="flex gap-1.5">
                {m.status !== "CANCELLED" && <button onClick={() => cancelMatch(m.id)} className="btn-ghost !px-2.5 !py-1 text-xs no-tap">ביטול</button>}
                <button onClick={() => deleteMatch(m.id)} className="btn-danger !px-2.5 !py-1 text-xs no-tap">מחיקה</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "cancels" && (
        <div className="space-y-2">
          {cancels.length === 0 && <div className="card text-sm text-slate-400">אין ביטולים.</div>}
          {cancels.map((c) => (
            <div key={c.id} className="card !py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{c.username} <span className="text-xs text-slate-500">· {c.matchTitle}</span></p>
                {c.late && <span className="chip bg-red-500/10 text-red-300 text-[10px]">מאוחר</span>}
              </div>
              {c.reason && <p className="mt-1 text-sm text-slate-400">"{c.reason}"</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "broadcast" && (
        <div className="card space-y-3">
          <label className="label">הודעת מערכת לכל המשתמשים</label>
          <textarea className="input min-h-[90px] resize-none" value={broadcast} onChange={(e) => setBroadcast(e.target.value)} maxLength={300} placeholder="לדוגמה: קומפ מיוחד בסוף השבוע!" />
          <button onClick={sendBroadcast} className="btn-primary no-tap">שליחה לכולם</button>
          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        </div>
      )}
    </div>
  );
}
