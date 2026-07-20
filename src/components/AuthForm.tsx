"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";

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
    if (res?.error) {
      setError(res.error);
      return;
    }
    sfx.success();
    router.push("/matches");
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card mx-auto max-w-md"
    >
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              sfx.soft();
              setMode(m);
              setError(null);
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition no-tap ${
              mode === m ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white" : "text-slate-400"
            }`}
          >
            {m === "login" ? t("auth.login.submit") : t("auth.register.submit")}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.h1
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-5 font-display text-2xl font-bold"
        >
          {mode === "login" ? t("auth.login.title") : t("auth.register.title")}
        </motion.h1>
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">
            {t("auth.username")}
          </label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">
            {t("auth.password")}
          </label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 no-tap">
          {loading ? "…" : mode === "login" ? t("auth.login.submit") : t("auth.register.submit")}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">{t("auth.guestNote")}</p>
    </motion.div>
  );
}
