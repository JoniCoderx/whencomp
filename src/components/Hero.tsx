"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-base-900/40 px-6 py-16 md:px-12 md:py-24">
      {/* animated glow orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-neon-blue/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-neon-purple/20 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-3xl text-center"
      >
        <motion.span
          variants={item}
          className="chip mx-auto mb-6 border border-neon-purple/30 bg-neon-purple/10 text-neon-violet"
        >
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon-lime" />
          {t("hero.badge")}
        </motion.span>

        <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
          <motion.span variants={item} className="block">
            {t("hero.title1")}
          </motion.span>
          <motion.span
            variants={item}
            className="block bg-gradient-to-r from-neon-electric via-neon-blue to-neon-purple bg-clip-text text-transparent text-glow"
          >
            {t("hero.title2")}
          </motion.span>
          <motion.span variants={item} className="block">
            {t("hero.title3")}
          </motion.span>
        </h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-base text-slate-300 md:text-lg"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/matches"
            onClick={() => sfx.matchStart()}
            className="btn-primary px-6 py-3 text-base"
          >
            {t("hero.cta.primary")} →
          </Link>
          <Link
            href="/create"
            onClick={() => sfx.click()}
            className="btn-ghost px-6 py-3 text-base"
          >
            {t("hero.cta.secondary")}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
