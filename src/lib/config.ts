// App-wide constants (no secrets here).

// Community Discord invite — a single button everyone can use.
// Override at deploy time with NEXT_PUBLIC_DISCORD_URL.
export const DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/whencomp";

export const APP_NAME = "WHEN COMP";

// A comp is a single 5-stack — 5 players total, full at 5.
export const COMP_CAPACITY = 5;

// The captain (main account) is pinned to the top of the roster.
export const CAPTAIN_USERNAME = "HackerMotherFucker";
