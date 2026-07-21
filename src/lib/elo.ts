// Lightweight Elo + MVP reward logic used by the post-match system.

export const MVP_ELO_BONUS = 25;
export const PLAY_ELO_BASE = 8;

/**
 * Compute the Elo delta a player earns from a completed match.
 * Everyone gets a small participation reward; the MVP gets a bonus.
 */
export function computeEloDelta(opts: { isMvp: boolean }): number {
  let delta = PLAY_ELO_BASE;
  if (opts.isMvp) delta += MVP_ELO_BONUS;
  return delta;
}

export function eloTier(elo: number): { name: string; color: string } {
  if (elo >= 1600) return { name: "אגדה", color: "#f59e0b" };
  if (elo >= 1400) return { name: "יהלום", color: "#22d3ee" };
  if (elo >= 1200) return { name: "פלטינה", color: "#c4b5fd" };
  if (elo >= 1050) return { name: "זהב", color: "#fbbf24" };
  if (elo >= 950) return { name: "כסף", color: "#cbd5e1" };
  return { name: "ארד", color: "#d97706" };
}
