"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { Logo } from "./Logo";

export function AuthForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sfx.click();
    const res = await signIn("credentials", {
      username,
      password,
      register: mode === "register" ? "true" : "false",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) { setError(res.error); return; }
    sfx.success();
    router.push("/matches");
    router.refresh();
  }

  async function guestEnter() {
    setError(null);
    setLoading(true);
    sfx.click();
    const res = await signIn("credentials", { guest: "true", guestName: username.trim(), redirect: false });
    setLoading(false);
    if (res?.error) { setError(res.error); return; }
    sfx.success();
    router.push("/matches");
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card mx-auto max-w-md">
      <div className="mb-6 flex justify-center"><Logo size={40} /></div>
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
        {(["login", "register"] as const).map((m) => (
          <button key={m} onClick={() => { sfx.soft(); setMode(m); setError(null); }} className={`rounded-lg py-2 text-sm font-bold transition no-tap ${mode === m ? "bg-gradient-to-b from-brand-400 to-brand-600 text-ink-950" : "text-slate-400"}`}>
            {m === "login" ? t("auth.login.submit") : t("auth.register.submit")}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t("auth.username")}</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" autoComplete="username" required minLength={2} />
        </div>
        <div>
          <label className="label">{t("auth.password")}</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={4} />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 no-tap">
          {loading ? "..." : mode === "login" ? t("auth.login.submit") : t("auth.register.submit")}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-slate-600">
        <span className="h-px flex-1 bg-white/10" />
        או
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <button onClick={guestEnter} disabled={loading} className="btn-ghost w-full py-3 no-tap">
        👤 כניסה כאורח
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        אפשר להיכנס בלי חשבון. אם תמלא שם למעלה — זה יהיה שם האורח שלך.
      </p>

      <p className="mt-4 text-center text-xs text-slate-500">{t("auth.guestNote")}</p>
    </motion.div>
  );
}
