import { mapMeta } from "@/lib/maps";

// Self-contained, "tactical minimap" style placeholder for a CS2 map. No
// external images — a stylized top-down layout tinted by the map accent, with
// A/B bomb-site markers. Deterministic per map code so each map looks distinct.
export function MapThumb({
  code,
  className = "",
  rounded = "rounded-xl",
  label = true,
}: {
  code?: string | null;
  className?: string;
  rounded?: string;
  label?: boolean;
}) {
  const m = mapMeta(code);
  const c = m.accent;
  // Vary the layout a little by hashing the code so maps don't look identical.
  const h = [...m.code].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const ax = 18 + (h % 7);
  const ay = 20 + ((h >> 3) % 8);
  const bx = 74 - ((h >> 5) % 8);
  const by = 66 - ((h >> 7) % 8);

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      <svg viewBox="0 0 100 60" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-label={m.name}>
        <defs>
          <linearGradient id={`mg-${m.code}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c} stopOpacity="0.32" />
            <stop offset="1" stopColor="#0b0d10" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill="#0b0d10" />
        <rect width="100" height="60" fill={`url(#mg-${m.code})`} />
        {/* faint tactical grid */}
        <g stroke={c} strokeOpacity="0.14" strokeWidth="0.4">
          {[10, 20, 30, 40, 50].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
          {[15, 30, 45, 60, 75, 90].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="60" />
          ))}
        </g>
        {/* stylized routes / buildings */}
        <g fill={c} fillOpacity="0.18" stroke={c} strokeOpacity="0.5" strokeWidth="0.6">
          <path d={`M${ax - 6},${ay - 6} h20 v13 h-20 z`} />
          <path d={`M${bx - 12},${by - 8} h20 v14 h-20 z`} />
          <path d="M42,8 l16,0 l6,44 l-28,0 z" fillOpacity="0.1" />
        </g>
        {/* bomb sites */}
        <g fontFamily="monospace" fontWeight="bold">
          <circle cx={ax} cy={ay} r="5.5" fill="#0b0d10" stroke={c} strokeWidth="1.1" />
          <text x={ax} y={ay + 2.4} textAnchor="middle" fontSize="6" fill={c}>A</text>
          <circle cx={bx} cy={by} r="5.5" fill="#0b0d10" stroke={c} strokeWidth="1.1" />
          <text x={bx} y={by + 2.4} textAnchor="middle" fontSize="6" fill={c}>B</text>
        </g>
      </svg>
      {label && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
          <span className="text-xs">{m.emoji}</span>
          <span className="truncate text-[11px] font-bold text-white/90">{m.name}</span>
        </div>
      )}
    </div>
  );
}
