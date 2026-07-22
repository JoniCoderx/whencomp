"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx } from "@/lib/sound";
import { Logo } from "./Logo";
import { SoundToggle } from "./Controls";

// Mobile-only top bar. Desktop uses the full <Navbar/> (hidden on mobile), so
// without this there was no logo and nowhere to tap to hear the sound on phones.
export function MobileTopBar() {
  const { t } = useI18n();
  const { data: session } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-40 md:hidden safe-top">
      <div className="mx-3 mt-2 flex items-center justify-between gap-2 rounded-2xl glass px-3 py-2">
        {/* Tap the logo to hear the sound (also goes home). */}
        <Link href="/" onClick={() => sfx.logo()} aria-label="WHEN COMP — בית" className="no-tap">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-1.5">
          <SoundToggle />
          {session?.user ? (
            <Link href="/profile" onClick={() => sfx.soft()} className="btn-ghost !px-3 !py-1.5 text-xs no-tap max-w-[9rem] truncate">
              {session.user.name}
            </Link>
          ) : (
            <Link href="/login" onClick={() => sfx.click()} className="btn-primary !px-3.5 !py-1.5 text-xs no-tap">
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
