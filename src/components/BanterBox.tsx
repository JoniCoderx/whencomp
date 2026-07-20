"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { generateBanter } from "@/lib/banter";
import { sfx } from "@/lib/sound";
import type { MatchDTO } from "@/lib/types";

export function BanterBox({ match }: { match: MatchDTO }) {
  const { t } = useI18n();
  const players = match.participants.map((p) => p.displayName ?? p.username);
  const [line, setLine] = useState<string>(() =>
    generateBanter({ game: match.game, players })
  );
  const [nonce, setNonce] = useState(0);

  function reroll() {
    sfx.click();
    // Vary the seed by rotating the player list so re-rolls feel fresh.
    const rotated = [...players.slice(nonce % Math.max(1, players.length)), ...players];
    setLine(generateBanter({ game: match.game, players: rotated }));
    setNonce((n) => n + 1);
  }

  return (
    <div className="card bg-gradient-to-br from-neon-purple/10 to-transparent">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-neon-violet">
          🔥 {t("lobby.banter")}
        </h3>
        <button onClick={reroll} className="btn-ghost !px-3 !py-1.5 text-xs no-tap">
          {t("lobby.banter.generate")}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-sm leading-relaxed text-slate-200"
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
