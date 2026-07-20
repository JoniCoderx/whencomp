"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

export function Features() {
  const { t } = useI18n();
  const features = [
    {
      icon: "⚡",
      title: t("feature.schedule.title"),
      desc: t("feature.schedule.desc"),
      glow: "shadow-neon-cyan",
    },
    {
      icon: "🎧",
      title: t("feature.lobby.title"),
      desc: t("feature.lobby.desc"),
      glow: "shadow-neon-purple",
    },
    {
      icon: "📊",
      title: t("feature.stats.title"),
      desc: t("feature.stats.desc"),
      glow: "shadow-neon-blue",
    },
  ];

  return (
    <section className="mt-14">
      <h2 className="mb-6 text-center font-display text-2xl font-bold md:text-3xl">
        {t("features.title")}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 120, damping: 18 }}
            whileHover={{ y: -6 }}
            className={`card group text-center ${f.glow} hover:shadow-none`}
          >
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl transition group-hover:scale-110">
              {f.icon}
            </div>
            <h3 className="font-display text-lg font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
