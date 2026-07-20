export type GameKey = "CS2" | "Valorant" | "COD";

export interface GameMeta {
  key: GameKey;
  label: string; // Hebrew-friendly short label
  full: string;
  accent: string; // hex accent
  emoji: string;
}

export const GAMES: Record<GameKey, GameMeta> = {
  CS2: {
    key: "CS2",
    label: "CS2",
    full: "Counter-Strike 2",
    accent: "#f59e0b",
    emoji: "🎯",
  },
  Valorant: {
    key: "Valorant",
    label: "Valorant",
    full: "Valorant",
    accent: "#ff4655",
    emoji: "⚡",
  },
  COD: {
    key: "COD",
    label: "COD",
    full: "Call of Duty",
    accent: "#84cc16",
    emoji: "💥",
  },
};

export const GAME_LIST = Object.values(GAMES);

export function gameMeta(game: string): GameMeta {
  return GAMES[game as GameKey] ?? GAMES.CS2;
}
