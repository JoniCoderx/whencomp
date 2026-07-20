"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { formatMatchTime, cn } from "@/lib/format";
import { GameLogo } from "./GameLogo";
import { buildShareText, whatsappLink, type ShareMatch } from "@/lib/share";

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function CreateForm() {
  const { t } = useI18n();
  const router = useRouter();
  const { status } = useSession();

  const [step, setStep] = useState<"form" | "preview" | "done">("form");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState("22:00");
  const [notes, setNotes] = useState("");
  const [discord, setDiscord] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string } | null>(null);

  const scheduledAt = new Date(`${date}T${time}:00`);
  const isPast = scheduledAt.getTime() < Date.now();

  function toPreview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (status !== "authenticated") return router.push("/login");
    if (title.trim().length < 2) return setError("שם הקומפ קצר מדי");
    if (isPast) return setError("לא ניתן לקבוע קומפ לתאריך שכבר עבר");
    sfx.click();
    setStep("preview");
  }

  async function publish() {
    setLoading(true);
    setError(null);
    sfx.matchStart();
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), game: "CS2", scheduledAt: scheduledAt.toISOString(), notes, discordLink: discord, isPrivate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "שגיאה ביצירה"); setStep("form"); return; }
      setCreated({ id: data.id });
      setStep("done");
    } catch {
      setError("שגיאת רשת");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && created) {
    const url = typeof window !== "undefined" ? `${window.location.origin}/matches/${created.id}` : "";
    const sm: ShareMatch = { title, scheduledAt, url, confirmed: 1, capacity: 5, discordLink: discord };
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card mx-auto max-w-md text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-3xl">✅</div>
        <h1 className="font-display text-2xl font-bold">הקומפ נוצר!</h1>
        <p className="mt-1 text-slate-400">{formatMatchTime(scheduledAt)}</p>
        <div className="mt-5 flex flex-col gap-2">
          <a href={whatsappLink(buildShareText(sm))} target="_blank" rel="noreferrer" onClick={() => sfx.soft()} className="btn-success no-tap">📲 שיתוף בוואטסאפ</a>
          <Link href={`/matches/${created.id}`} onClick={() => sfx.soft()} className="btn-primary no-tap">לעמוד הקומפ</Link>
          <Link href="/matches" className="btn-ghost no-tap">לכל הקומפים</Link>
        </div>
      </motion.div>
    );
  }

  if (step === "preview") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-md">
        <h1 className="font-display text-xl font-bold">תצוגה מקדימה</h1>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5"><GameLogo game="CS2" size={26} /></div>
            <div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="text-sm text-slate-400">{formatMatchTime(scheduledAt)}</p>
            </div>
          </div>
          {notes && <p className="mt-3 text-sm text-slate-300">{notes}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="chip bg-white/5 text-slate-300">עד 5 שחקנים</span>
            {isPrivate && <span className="chip bg-white/5 text-slate-300">🔒 פרטי</span>}
            {discord && <span className="chip bg-white/5 text-slate-300">🎧 דיסקורד</span>}
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={publish} disabled={loading} className="btn-primary flex-1 py-3 no-tap">{loading ? "מפרסם..." : "פרסום הקומפ"}</button>
          <button onClick={() => setStep("form")} className="btn-ghost no-tap">חזרה</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={toPreview} className="card mx-auto max-w-md space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{t("create.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("create.teamNote")}</p>
      </div>
      <div>
        <label className="label">{t("create.field.title")}</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="קומפ ליל שלישי" required minLength={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t("create.field.date")}</label>
          <input type="date" className="input" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="label">{t("create.field.time")}</label>
          <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>
      {isPast && <p className="text-sm text-red-400">התאריך שנבחר כבר עבר</p>}
      <div>
        <label className="label">{t("create.field.discord")}</label>
        <input className="input" type="url" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="https://discord.gg/..." />
      </div>
      <div>
        <label className="label">{t("create.field.notes")}</label>
        <textarea className="input min-h-[70px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={280} placeholder="מפה, רמה, כל מה שחשוב" />
      </div>
      <button type="button" onClick={() => { sfx.soft(); setIsPrivate((v) => !v); }} className={cn("flex w-full items-center justify-between rounded-xl border px-4 py-3 no-tap", isPrivate ? "border-brand-500/50 bg-brand-500/10" : "border-white/10 bg-white/5")}>
        <span className="text-sm font-bold">קומפ פרטי (בהזמנה בלבד)</span>
        <span className={cn("h-6 w-11 rounded-full p-0.5 transition", isPrivate ? "bg-brand-500" : "bg-white/15")}>
          <span className={cn("block h-5 w-5 rounded-full bg-white transition", isPrivate ? "-translate-x-5" : "")} />
        </span>
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" className="btn-primary w-full py-3 text-base no-tap">תצוגה מקדימה</button>
    </motion.form>
  );
}
