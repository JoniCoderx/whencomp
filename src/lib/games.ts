export type GameKey = "CS2" | "Valorant" | "COD";

export interface GameMeta {
  key: GameKey;
  label: string;
  accent: string; // tailwind text color
  glow: string; // tailwind shadow
  emoji: string;
  gradient: string;
}

export const GAMES: Record<GameKey, GameMeta> = {
  CS2: {
    key: "CS2",
    label: "Counter-Strike 2",
    accent: "text-neon-electric",
    glow: "shadow-neon-cyan",
    emoji: "🔫",
    gradient: "from-cyan-500/20 to-blue-600/10",
  },
  Valorant: {
    key: "Valorant",
    label: "Valorant",
    accent: "text-neon-pink",
    glow: "shadow-neon-purple",
    emoji: "🎯",
    gradient: "from-pink-500/20 to-red-600/10",
  },
  COD: {
    key: "COD",
    label: "Call of Duty",
    accent: "text-neon-lime",
    glow: "shadow-neon-blue",
    emoji: "💥",
    gradient: "from-lime-500/20 to-green-600/10",
  },
};

export const GAME_LIST = Object.values(GAMES);

export function gameMeta(game: string): GameMeta {
  return GAMES[game as GameKey] ?? GAMES.CS2;
}
