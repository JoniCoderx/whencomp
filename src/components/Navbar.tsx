"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/i18n/I18nProvider";
import { ThemeToggle, LocaleToggle, SoundToggle } from "./Controls";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/matches", label: t("nav.matches") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    { href: "/create", label: t("nav.create") },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 hidden md:block">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-4 rounded-2xl glass px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 no-tap" onClick={() => sfx.soft()}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple font-display text-lg font-bold shadow-neon-purple">
            W
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            When<span className="text-neon-purple">Comp</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => sfx.soft()}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-semibold transition no-tap",
                  active
                    ? "bg-white/10 text-white shadow-neon-blue"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <SoundToggle />
          <LocaleToggle />
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                onClick={() => sfx.soft()}
                className="btn-ghost !px-3 !py-2 text-sm no-tap"
              >
                {session.user.name}
              </Link>
              <button
                className="btn-ghost !px-3 !py-2 text-sm no-tap"
                onClick={() => {
                  sfx.click();
                  signOut({ callbackUrl: "/" });
                }}
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => sfx.click()} className="btn-primary !px-4 !py-2 text-sm no-tap">
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
