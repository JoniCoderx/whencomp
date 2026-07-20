"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { GAME_LIST } from "@/lib/games";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";

function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function CreateForm() {
  const { t } = useI18n();
  const router = useRouter();
  const { status } = useSession();

  const [title, setTitle] = useState("");
  const [game, setGame] = useState(GAME_LIST[0].key);
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState("21:00");
  const [discord, setDiscord] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    sfx.matchStart();
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, game, scheduledAt, discordLink: discord, maxPlayers, notes }),
      });
      if (!res.ok) {
        setError("Could not create match. Check your inputs.");
        setLoading(false);
        return;
      }
      const created = await res.json();
      router.push(`/matches/${created.id}`);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="card mx-auto max-w-xl space-y-5"
    >
      <div>
        <h1 className="font-display text-2xl font-bold">{t("create.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("create.subtitle")}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">
          {t("create.field.title")}
        </label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Friday Night Rush"
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">
          {t("create.field.game")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GAME_LIST.map((g) => (
            <button
              type="button"
              key={g.key}
              onClick={() => {
                sfx.click();
                setGame(g.key);
              }}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-semibold transition no-tap",
                game === g.key
                  ? "border-neon-purple/60 bg-neon-purple/15 text-white shadow-neon-purple"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              )}
            >
              <span className="mr-1">{g.emoji}</span>
              {g.key}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">
            {t("create.field.date")}
          </label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">
            {t("create.field.time")}
          </label>
          <input
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">
            {t("create.field.discord")}
          </label>
          <input
            className="input"
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="https://discord.gg/..."
            type="url"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">
            {t("create.field.max")}
          </label>
          <input
            type="number"
            className="input"
            value={maxPlayers}
            min={2}
            max={64}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 10)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">
          {t("create.field.notes")}
        </label>
        <textarea
          className="input min-h-[80px] resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={280}
          placeholder="Bring your A-game 🎯"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base no-tap">
        {loading ? t("create.launching") : t("create.submit")}
      </button>
    </motion.form>
  );
}
