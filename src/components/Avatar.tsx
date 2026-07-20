import { initials } from "@/lib/format";

export function Avatar({
  name,
  color = "#3b82f6",
  size = 40,
  ring = false,
}: {
  name: string;
  color?: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shrink-0 ${
        ring ? "ring-2 ring-white/20" : ""
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${color}, ${shade(color, -30)})`,
        boxShadow: `0 0 ${size * 0.4}px ${color}55`,
      }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.replace(/(.)/g, "$1$1") : c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
