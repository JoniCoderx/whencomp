import { gameMeta, type GameKey } from "@/lib/games";

// Premium ORIGINAL vector marks for each game (NOT the trademarked official
// logos). Each reads instantly as its game via crosshair/emblem language and is
// tinted by the game accent. Rendered as inline SVG (local, sharp at any size,
// no external requests, no broken URLs). `glow` adds a soft accent halo.
export function GameLogo({
  game,
  size = 28,
  className = "",
  glow = false,
}: {
  game: string;
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const meta = gameMeta(game);
  const c = meta.accent;
  const gid = `wcg-${meta.key}`;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    className,
    fill: "none" as const,
    style: glow ? { filter: `drop-shadow(0 0 ${size * 0.18}px ${c}66)` } : undefined,
  };
  // Shared subtle accent gradient (identical defs across instances are harmless).
  const defs = (
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={c} />
        <stop offset="1" stopColor={c} stopOpacity="0.65" />
      </linearGradient>
    </defs>
  );

  if (meta.key === ("CS2" as GameKey)) {
    // Beveled tactical hex + precision crosshair.
    return (
      <svg {...common} aria-label="Counter-Strike 2 (mark)" role="img">
        {defs}
        <path d="M24 3l16 9v18l-16 9-16-9V12l16-9z" fill={`url(#${gid})`} fillOpacity="0.1" />
        <path d="M24 3l16 9v18l-16 9-16-9V12l16-9z" stroke={`url(#${gid})`} strokeWidth="2.4" strokeLinejoin="round" opacity="0.7" />
        <circle cx="24" cy="24" r="8.5" stroke={`url(#${gid})`} strokeWidth="2.4" />
        <path d="M24 7.5v8M24 32.5v8M7.5 24h8M32.5 24h8" stroke={c} strokeWidth="2.7" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.3" fill={c} />
      </svg>
    );
  }

  if (meta.key === ("Valorant" as GameKey)) {
    // Sharp angular V.
    return (
      <svg {...common} aria-label="Valorant (mark)" role="img">
        {defs}
        <path d="M6.5 8.5h9.5l8 15 8-15h9.5L26.5 41.5h-5L6.5 8.5z" fill={`url(#${gid})`} fillOpacity="0.14" />
        <path d="M6.5 8.5h9.5l8 15 8-15h9.5" stroke={`url(#${gid})`} strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M16 23.5l8 15 8-15" stroke={c} strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  if (meta.key === ("Fortnite" as GameKey)) {
    // Drop-shield with a bolt.
    return (
      <svg {...common} aria-label="Fortnite (mark)" role="img">
        {defs}
        <path d="M24 4l15 5v10c0 10.5-7 16.5-15 20.5C16 35.5 9 29.5 9 19V9l15-5z" fill={`url(#${gid})`} fillOpacity="0.14" />
        <path d="M24 4l15 5v10c0 10.5-7 16.5-15 20.5C16 35.5 9 29.5 9 19V9l15-5z" stroke={`url(#${gid})`} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M26 12l-8 11h6l-2 9 8-12h-6l2-8z" fill={c} />
      </svg>
    );
  }

  // COD — winged reticle.
  return (
    <svg {...common} aria-label="Call of Duty (mark)" role="img">
      {defs}
      <circle cx="24" cy="24" r="12" stroke={`url(#${gid})`} strokeWidth="2.4" opacity="0.7" />
      <path d="M24 6v10M24 32v10M6 24h10M32 24h10" stroke={c} strokeWidth="2.7" strokeLinecap="round" />
      <path d="M14.5 14.5l6 6M33.5 14.5l-6 6M14.5 33.5l6-6M33.5 33.5l-6-6" stroke={c} strokeWidth="2.1" strokeLinecap="round" opacity="0.65" />
      <circle cx="24" cy="24" r="2.4" fill={c} />
    </svg>
  );
}
