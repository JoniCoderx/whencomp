"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatTimeOnly, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";
import type { MessageDTO } from "@/lib/types";

export function ChatBox({ matchId }: { matchId: string }) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAt = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const poll = useCallback(async () => {
    try {
      const q = lastAt.current ? `?since=${encodeURIComponent(lastAt.current)}` : "";
      const res = await fetch(`/api/matches/${matchId}/messages${q}`);
      if (!res.ok) return;
      const fresh: MessageDTO[] = await res.json();
      if (fresh.length) {
        lastAt.current = fresh[fresh.length - 1].createdAt;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const merged = [...prev, ...fresh.filter((m) => !seen.has(m.id))];
          return merged;
        });
        scrollToBottom();
      }
    } catch {}
  }, [matchId, scrollToBottom]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [poll]);

  async function send() {
    const body = input.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    sfx.soft();
    try {
      const res = await fetch(`/api/matches/${matchId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "שגיאה"); return; }
      setInput("");
      setMessages((prev) => [...prev, data]);
      lastAt.current = data.createdAt;
      scrollToBottom();
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("למחוק את ההודעה?")) return;
    const res = await fetch(`/api/matches/${matchId}/messages/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="card flex h-[440px] flex-col p-0">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="font-display text-sm font-bold">💬 {t("chat.title")}</h3>
      </div>

      <div ref={scrollRef} className="hide-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <p className="pt-10 text-center text-sm text-slate-500">{t("chat.empty")}</p>}
        {messages.map((m) =>
          m.kind === "SYSTEM" ? (
            <p key={m.id} className="text-center text-xs text-slate-500">— {m.body} —</p>
          ) : (
            <div key={m.id} className={cn("group flex items-start gap-2", m.userId === userId && "flex-row-reverse")}>
              <Avatar name={m.username} color={m.avatarColor} src={m.avatarUrl} size={30} />
              <div className={cn("max-w-[75%]", m.userId === userId && "text-left")}>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500" dir="rtl">
                  <span className="font-bold text-slate-300">{m.username}</span>
                  <span>{formatTimeOnly(m.createdAt)}</span>
                  {(m.userId === userId || isAdmin) && (
                    <button onClick={() => remove(m.id)} className="opacity-0 transition group-hover:opacity-100 hover:text-red-400" title="מחיקה">✕</button>
                  )}
                </div>
                <div className={cn("mt-0.5 inline-block rounded-2xl px-3 py-1.5 text-sm", m.userId === userId ? "bg-brand-500/20 text-brand-100" : "bg-white/[0.06]")}>
                  {m.body}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="border-t border-white/5 p-3">
        {userId ? (
          <div className="flex gap-2">
            <input
              className="input !py-2.5"
              placeholder={t("chat.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !sending && send()}
              maxLength={500}
            />
            <button onClick={send} disabled={sending || !input.trim()} className="btn-primary !px-4 no-tap">
              {t("chat.send")}
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-ghost w-full no-tap">{t("chat.loginToChat")}</Link>
        )}
        {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
