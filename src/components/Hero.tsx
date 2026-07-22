"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { DISCORD_URL } from "@/lib/config";
import { LogoMark } from "./Logo";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900/50 px-6 py-12 md:px-12 md:py-16">
      {/* CS team photo — elegantly cropped, heavily darkened so it reads as
          texture and never competes with the copy. */}
      <img
        src="/cs-team.webp"
        alt=""
        aria-hidden
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_22%] opacity-[0.10] md:opacity-[0.17]"
      />
      {/* Heavier veil on mobile so the copy stays crisp on a bright phone. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/65 to-ink-950/95 md:from-ink-950/75 md:via-ink-950/55 md:to-ink-950/90"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex justify-center">
          <LogoMark size={56} />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="chip mx-auto mb-4 border border-brand-500/25 bg-brand-500/10 text-brand-300"
        >
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-400" />
          {t("hero.badge")}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl font-black leading-tight md:text-6xl"
        >
          {t("hero.title1")}{" "}
          <span className="wc-sheen">{t("hero.title2")}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mx-auto mt-4 max-w-lg text-base text-slate-300 md:text-lg"
        >
          {t("hero.subtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="relative">
            {/* One-shot tactical flash when the CTA enters (decorative) */}
            <span
              aria-hidden
              className="wc-flash pointer-events-none absolute -inset-3 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(251,191,36,0.55), transparent 60%)" }}
            />
            <Link href="/matches" onClick={() => sfx.matchStart()} className="btn-primary relative px-6 py-3 text-base">
              {t("hero.cta.primary")}
            </Link>
          </span>
          <Link href="/create" onClick={() => sfx.click()} className="btn-ghost px-6 py-3 text-base">
            {t("hero.cta.secondary")}
          </Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" onClick={() => sfx.soft()} className="btn-ghost px-6 py-3 text-base">
            💬 {t("hero.discord")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
