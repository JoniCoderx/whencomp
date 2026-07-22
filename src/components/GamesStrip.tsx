import { GAME_LIST } from "@/lib/games";
import { GameLogo } from "./GameLogo";

// Restrained "games we play" row for the homepage. CS2 is featured first.
export function GamesStrip() {
  return (
    <section aria-label="המשחקים">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-slate-200">המשחקים שלנו</h2>
        <span className="text-xs text-slate-500">CS2 בראש</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GAME_LIST.map((g) => (
          <div
            key={g.key}
            className={[
              "group flex items-center gap-3 rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5",
              g.key === "CS2" ? "cs2-tactical" : "",
            ].join(" ")}
            style={{
              borderColor: `${g.accent}33`,
              background: g.key === "CS2" ? undefined : `linear-gradient(180deg, ${g.accent}10, transparent)`,
            }}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.04]">
              <GameLogo game={g.key} size={26} glow />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-black text-slate-100">{g.label}</p>
              <p className="truncate text-[11px] text-slate-500">{g.full}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
