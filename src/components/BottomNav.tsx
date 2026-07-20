"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session?.user) { setUnread(0); return; }
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const d = await res.json();
        if (alive) setUnread(d.unread ?? 0);
      } catch {}
    };
    load();
    const id = setInterval(load, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [session?.user, pathname]);

  const items = [
    { href: "/", label: t("nav.home"), icon: "🏠" },
    { href: "/matches", label: t("nav.matches"), icon: "🎮" },
    { href: "/create", label: "יצירה", icon: "➕", accent: true },
    { href: "/notifications", label: t("nav.notifications"), icon: "🔔", badge: unread },
    { href: session?.user ? "/profile" : "/login", label: session?.user ? t("nav.profile") : t("nav.login"), icon: "👤" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden safe-bottom">
      <div className="mx-3 mb-2 flex items-stretch justify-around gap-1 rounded-2xl glass px-2 py-1.5">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} onClick={() => sfx.soft()} className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 no-tap">
              {active && <motion.span layoutId="bn" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={cn("relative text-xl leading-none", it.accent && "grid h-9 w-9 -mt-4 place-items-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-ink-950 shadow-glow-amber")}>
                {it.icon}
                {!!it.badge && it.badge > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{it.badge > 9 ? "9+" : it.badge}</span>
                )}
              </span>
              <span className={cn("relative text-[10px] font-bold", active ? "text-white" : "text-slate-400")}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
