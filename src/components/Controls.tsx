"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n/I18nProvider";
import { sfx, soundEnabled, setMuted } from "@/lib/sound";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme !== "light";
  return (
    <button
      aria-label="Toggle theme"
      className="btn-ghost !px-3 !py-2 no-tap"
      onClick={() => {
        sfx.click();
        setTheme(isDark ? "light" : "dark");
      }}
    >
      {mounted ? (isDark ? "🌙" : "☀️") : "🌓"}
    </button>
  );
}

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      aria-label="Toggle language"
      className="btn-ghost !px-3 !py-2 text-sm font-bold no-tap"
      onClick={() => {
        sfx.click();
        setLocale(locale === "en" ? "he" : "en");
      }}
    >
      {locale === "en" ? "עב" : "EN"}
    </button>
  );
}

export function SoundToggle() {
  const [muted, setMutedState] = useState(false);
  useEffect(() => setMutedState(!soundEnabled()), []);
  return (
    <button
      aria-label="Toggle sound"
      className="btn-ghost !px-3 !py-2 no-tap"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (!next) sfx.success();
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
