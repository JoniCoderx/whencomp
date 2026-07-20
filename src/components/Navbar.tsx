"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/i18n/I18nProvider";
import { SoundToggle } from "./Controls";
import { Logo } from "./Logo";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/format";
import { DISCORD_URL } from "@/lib/config";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/matches", label: t("nav.matches") },
    { href: "/players", label: t("nav.players") },
    { href: "/create", label: t("nav.create") },
    { href: "/notifications", label: t("nav.notifications") },
  ];
  if (isAdmin) links.push({ href: "/admin", label: t("nav.admin") });

  return (
    <header className="fixed inset-x-0 top-0 z-40 hidden md:block">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-4 rounded-2xl glass px-4 py-2.5">
        <Link href="/" onClick={() => sfx.soft()}>
          <Logo size={34} />
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
                  "rounded-xl px-3.5 py-2 text-sm font-bold transition no-tap",
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => sfx.soft()}
            className="btn-ghost !px-3 !py-2 text-sm no-tap"
            title="Discord"
          >
            💬
          </a>
          <SoundToggle />
          {session?.user ? (
            <>
              <Link href="/profile" onClick={() => sfx.soft()} className="btn-ghost !px-3 !py-2 text-sm no-tap">
                {session.user.name}
              </Link>
              <button
                className="btn-ghost !px-3 !py-2 text-sm no-tap"
                onClick={() => { sfx.click(); signOut({ callbackUrl: "/" }); }}
              >
                {t("nav.logout")}
              </button>
            </>
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
