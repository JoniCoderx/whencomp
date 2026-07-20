"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session } = useSession();

  const items = [
    { href: "/", label: t("nav.home"), icon: "🏠" },
    { href: "/matches", label: t("nav.matches"), icon: "🎮" },
    { href: "/create", label: t("nav.create"), icon: "➕", accent: true },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: "🏆" },
    {
      href: session?.user ? "/profile" : "/login",
      label: session?.user ? t("nav.profile") : t("nav.login"),
      icon: "👤",
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden safe-bottom">
      <div className="mx-3 mb-2 flex items-stretch justify-around gap-1 rounded-2xl glass px-2 py-1.5">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => sfx.soft()}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 no-tap"
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute inset-0 rounded-xl bg-white/10 shadow-neon-blue"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "relative text-xl leading-none",
                  it.accent && "grid h-9 w-9 -mt-4 place-items-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-neon-purple"
                )}
              >
                {it.icon}
              </span>
              <span
                className={cn(
                  "relative text-[10px] font-semibold",
                  active ? "text-white" : "text-slate-400"
                )}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
