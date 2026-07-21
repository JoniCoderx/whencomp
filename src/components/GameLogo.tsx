import { gameMeta, type GameKey } from "@/lib/games";

// Clean, tactical SVG marks for each game (not official trademarks — original
// crosshair/emblem style icons that read instantly as CS / Valorant / COD).
export function GameLogo({
  game,
  size = 28,
  className = "",
}: {
  game: string;
  size?: number;
  className?: string;
}) {
  const meta = gameMeta(game);
  const c = meta.accent;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    className,
    fill: "none" as const,
  };

  if (meta.key === ("CS2" as GameKey)) {
    // Crosshair inside a beveled hex — Counter-Strike vibe.
    return (
      <svg {...common} aria-label="Counter-Strike 2">
        <path
          d="M24 3l16 9v18l-16 9-16-9V12l16-9z"
          stroke={c}
          strokeWidth="2.4"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <circle cx="24" cy="24" r="8.5" stroke={c} strokeWidth="2.4" />
        <path d="M24 8v8M24 32v8M8 24h8M32 24h8" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.2" fill={c} />
      </svg>
    );
  }

  if (meta.key === ("Valorant" as GameKey)) {
    // Angular V mark.
    return (
      <svg {...common} aria-label="Valorant">
        <path
          d="M7 9h9l8 15 8-15h9L26 41h-4L7 9z"
          fill={c}
          opacity="0.16"
        />
        <path
          d="M7 9h9l8 15 8-15h9"
          stroke={c}
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M16 24l8 15 8-15" stroke={c} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  if (meta.key === ("Fortnite" as GameKey)) {
    // Shield / drop marker.
    return (
      <svg {...common} aria-label="Fortnite">
        <path d="M24 4l15 5v11c0 10-7 16-15 20-8-4-15-10-15-20V9l15-5z" fill={c} opacity="0.14" />
        <path d="M24 4l15 5v11c0 10-7 16-15 20-8-4-15-10-15-20V9l15-5z" stroke={c} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M17 20h14M17 20v10M17 25h9" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // COD — reticle with wings.
  return (
    <svg {...common} aria-label="Call of Duty">
      <circle cx="24" cy="24" r="12" stroke={c} strokeWidth="2.4" opacity="0.55" />
      <path d="M24 6v10M24 32v10M6 24h10M32 24h10" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M14 14l6 6M34 14l-6 6M14 34l6-6M34 34l-6-6" stroke={c} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
      <circle cx="24" cy="24" r="2.4" fill={c} />
    </svg>
  );
}
