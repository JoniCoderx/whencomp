"use client";

import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatTimeOnly, cn } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { Avatar } from "./Avatar";
import type { MessageDTO } from "@/lib/types";

type Status = "sending" | "sent" | "failed";
interface ChatMsg extends MessageDTO {
  _status?: Status;
  _tempId?: string;
}

// Split text into plain runs + safe links. React escapes text, so this is
// XSS-safe; links get rel="noopener noreferrer nofollow".
function renderBody(body: string) {
  const parts = body.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a
        key={i}
        href={p}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-brand-300 underline break-all"
        dir="ltr"
      >
        {p}
      </a>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    )
  );
}

export function ChatBox({ matchId, allowGuests = true }: { matchId: string; allowGuests?: boolean }) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isGuest = (session?.user as any)?.isGuest === true;
  const guestBlocked = isGuest && !allowGuests;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [conn, setConn] = useState<"ok" | "reconnecting">("ok");
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAt = useRef<string | null>(null);
  const failCount = useRef(0);

  const nearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 90;
  };
  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
    setUnread(0);
    setAtBottom(true);
  }, []);

  const merge = useCallback((incoming: MessageDTO[]) => {
    if (!incoming.length) return;
    const wasBottom = nearBottom();
    let addedFromOthers = 0;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      if (!fresh.length) return prev;
      addedFromOthers = fresh.filter((m) => m.userId !== userId).length;
      return [...prev, ...fresh];
    });
    lastAt.current = incoming[incoming.length - 1].createdAt;
    if (wasBottom) scrollToBottom();
    else if (addedFromOthers > 0) setUnread((u) => u + addedFromOthers);
  }, [scrollToBottom, userId]);

  // Poll loop with reconnect state.
  const poll = useCallback(async () => {
    try {
      const q = lastAt.current ? `?since=${encodeURIComponent(lastAt.current)}` : "";
      const res = await fetch(`/api/matches/${matchId}/messages${q}`);
      if (!res.ok) throw new Error("bad");
      const fresh: MessageDTO[] = await res.json();
      failCount.current = 0;
      setConn("ok");
      merge(fresh);
    } catch {
      failCount.current += 1;
      if (failCount.current >= 2) setConn("reconnecting");
    }
  }, [matchId, merge]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/messages`);
        const data: MessageDTO[] = res.ok ? await res.json() : [];
        if (!alive) return;
        setMessages(data);
        if (data.length) lastAt.current = data[data.length - 1].createdAt;
        scrollToBottom();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const id = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [matchId, poll, scrollToBottom]);

  async function doSend(body: string, tempId: string) {
    setMessages((prev) =>
      prev.map((m) => (m._tempId === tempId ? { ...m, _status: "sending" } : m))
    );
    try {
      const res = await fetch(`/api/matches/${matchId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("send failed");
      const saved: MessageDTO = await res.json();
      lastAt.current = saved.createdAt;
      // The 3s poll may have already appended this same message (real id) in the
      // window before our POST resolved. Drop that copy, then swap temp→saved so
      // we never render two bubbles with the same key.
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== saved.id)
          .map((m) => (m._tempId === tempId ? { ...saved } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._tempId === tempId ? { ...m, _status: "failed" } : m))
      );
    }
  }

  function send() {
    const body = input.trim();
    if (!body) return; // never submit empty
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic: ChatMsg = {
      id: tempId,
      _tempId: tempId,
      _status: "sending",
      body,
      kind: "USER",
      createdAt: new Date().toISOString(),
      userId: userId ?? null,
      username: session?.user?.name ?? "אני",
      avatarColor: (session?.user as any)?.avatarColor ?? "#f59e0b",
      avatarUrl: (session?.user as any)?.avatarUrl ?? null,
      isGuest: (session?.user as any)?.isGuest ?? false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    sfx.soft();
    scrollToBottom(true);
    doSend(body, tempId);
  }

  function retry(m: ChatMsg) {
    if (m._tempId) doSend(m.body, m._tempId);
  }

  async function remove(id: string) {
    if (!confirm("למחוק את ההודעה?")) return;
    const res = await fetch(`/api/matches/${matchId}/messages/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="card relative flex h-[460px] flex-col p-0">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <h3 className="font-display text-sm font-bold">💬 {t("chat.title")}</h3>
        {conn === "reconnecting" && (
          <span className="chip bg-amber-500/15 text-amber-300 text-[10px]">מתחבר מחדש…</span>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={() => {
          const b = nearBottom();
          setAtBottom(b);
          if (b) setUnread(0);
        }}
        className="hide-scroll relative flex-1 space-y-1 overflow-y-auto px-4 py-4"
      >
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("flex items-start gap-2", i % 2 && "flex-row-reverse")}>
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/10" />
                <div className="h-8 w-40 animate-pulse rounded-2xl bg-white/10" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-slate-500">{t("chat.empty")}</p>
          </div>
        ) : (
          messages.map((m, idx) => {
            if (m.kind === "SYSTEM")
              return (
                <p key={m.id} className="py-1 text-center text-xs text-slate-500">
                  — {m.body} —
                </p>
              );
            const prev = messages[idx - 1];
            const grouped =
              prev &&
              prev.kind !== "SYSTEM" &&
              prev.userId === m.userId &&
              new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60000;
            const mine = m.userId && m.userId === userId;
            return (
              <div
                key={m.id}
                className={cn("group flex items-start gap-2", mine && "flex-row-reverse", grouped ? "mt-0.5" : "mt-3")}
              >
                <div className="w-8 shrink-0">
                  {!grouped && <Avatar name={m.username} color={m.avatarColor} src={m.avatarUrl} size={32} />}
                </div>
                <div className={cn("max-w-[76%]", mine && "items-end text-right")}>
                  {!grouped && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500" dir="rtl">
                      <span className="font-bold text-slate-300">{m.username}</span>
                      {(m.isGuest || !m.userId) && <span className="chip bg-white/10 text-slate-400 !px-1.5 !py-0 text-[9px]">אורח</span>}
                      <span>{formatTimeOnly(m.createdAt)}</span>
                      {(mine || isAdmin) && !m._status && (
                        <button onClick={() => remove(m.id)} className="opacity-0 transition group-hover:opacity-100 hover:text-red-400" title="מחיקה">
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                  <div
                    dir="auto"
                    className={cn(
                      "mt-0.5 inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-sm",
                      mine ? "bg-brand-500/20 text-brand-100" : "bg-white/[0.06]",
                      m._status === "sending" && "opacity-60",
                      m._status === "failed" && "border border-red-500/40"
                    )}
                  >
                    {renderBody(m.body)}
                  </div>
                  {m._status === "sending" && <p className="mt-0.5 text-[10px] text-slate-500">שולח…</p>}
                  {m._status === "failed" && (
                    <p className="mt-0.5 text-[10px] text-red-400">
                      נכשל ·{" "}
                      <button onClick={() => retry(m)} className="underline">
                        נסה שוב
                      </button>
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New-messages pill */}
      {!atBottom && unread > 0 && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute inset-x-0 bottom-20 mx-auto w-max rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold text-ink-950 shadow-glow-amber"
        >
          {unread} הודעות חדשות ↓
        </button>
      )}

      <div className="border-t border-white/5 p-3 safe-bottom">
        {userId && guestBlocked ? (
          <p className="rounded-xl bg-white/5 py-2.5 text-center text-xs text-slate-400">
            הצ׳אט סגור לאורחים בקומפ הזה
          </p>
        ) : userId ? (
          <div className="flex gap-2">
            <input
              className="input !py-2.5"
              placeholder={t("chat.placeholder")}
              value={input}
              enterKeyHint="send"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              maxLength={500}
            />
            <button onClick={send} disabled={!input.trim()} className="btn-primary !px-4 no-tap disabled:opacity-40">
              {t("chat.send")}
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-ghost w-full no-tap">
            {t("chat.loginToChat")}
          </Link>
        )}
      </div>
    </div>
  );
}
