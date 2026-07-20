// App-wide constants (no secrets here).

// Community Discord invite — a single button everyone can use.
// Override at deploy time with NEXT_PUBLIC_DISCORD_URL.
export const DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/whencomp";

export const APP_NAME = "WHEN COMP";

// Max players per team. A comp = two teams.
export const TEAM_SIZE = 5;
