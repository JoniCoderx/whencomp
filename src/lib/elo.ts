// Lightweight Elo + MVP reward logic used by the post-match system.

export const MVP_ELO_BONUS = 25;
export const PLAY_ELO_BASE = 8;

/**
 * Compute the Elo delta a player earns from a completed match.
 * Everyone gets a small participation reward; the MVP gets a bonus.
 */
export function computeEloDelta(opts: {
  isMvp: boolean;
  fpsRating?: number | null;
}): number {
  let delta = PLAY_ELO_BASE;
  if (opts.isMvp) delta += MVP_ELO_BONUS;
  // Reward reporting good server conditions marginally (encourages feedback).
  if (opts.fpsRating && opts.fpsRating >= 4) delta += 2;
  return delta;
}

export function eloTier(elo: number): { name: string; color: string } {
  if (elo >= 1600) return { name: "Radiant", color: "#f59e0b" };
  if (elo >= 1400) return { name: "Diamond", color: "#22d3ee" };
  if (elo >= 1200) return { name: "Platinum", color: "#a855f7" };
  if (elo >= 1050) return { name: "Gold", color: "#eab308" };
  if (elo >= 950) return { name: "Silver", color: "#94a3b8" };
  return { name: "Bronze", color: "#b45309" };
}
