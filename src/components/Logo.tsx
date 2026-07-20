export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="wc-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M24 2l19 11v22L24 46 5 35V13L24 2z"
        fill="#0b0d10"
        stroke="url(#wc-g)"
        strokeWidth="2.2"
      />
      {/* Crosshair */}
      <circle cx="24" cy="24" r="8" stroke="url(#wc-g)" strokeWidth="2.4" />
      <path
        d="M24 9v7M24 32v7M9 24h7M32 24h7"
        stroke="url(#wc-g)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="2.2" fill="#fbbf24" />
    </svg>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5 no-tap">
      <LogoMark size={size} />
      <span className="font-display text-lg font-black tracking-[0.14em] leading-none">
        WHEN<span className="text-brand-500"> COMP</span>
      </span>
    </span>
  );
}
