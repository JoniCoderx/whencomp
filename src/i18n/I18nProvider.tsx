"use client";

import { useEffect, type ReactNode } from "react";
import { t as translate } from "./dictionaries";

// Hebrew-only, RTL. Kept as a hook so existing components don't change shape.
export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = "he";
      document.documentElement.dir = "rtl";
    }
  }, []);
  return <>{children}</>;
}

export function useI18n() {
  return {
    t: translate,
    locale: "he" as const,
    dir: "rtl" as const,
  };
}
