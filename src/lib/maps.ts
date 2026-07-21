// Counter-Strike 2 active-duty + classic map pool. `code` is the canonical
// map name (de_dust2 …). Images are drawn as self-contained tactical SVG tiles
// (see MapThumb) so they always render without external requests.

export interface MapMeta {
  code: string; // de_dust2
  name: string; // short display
  he: string; // Hebrew label
  accent: string; // hex
  emoji: string;
}

export const CS_MAPS: MapMeta[] = [
  { code: "de_dust2",   name: "Dust II",  he: "דאסט 2",   accent: "#d9a441", emoji: "🏜️" },
  { code: "de_mirage",  name: "Mirage",   he: "מיראז'",   accent: "#e0b15a", emoji: "🏛️" },
  { code: "de_inferno", name: "Inferno",  he: "אינפרנו",  accent: "#d1663a", emoji: "🔥" },
  { code: "de_nuke",    name: "Nuke",     he: "נוק",      accent: "#8fb03e", emoji: "☢️" },
  { code: "de_overpass",name: "Overpass", he: "אוברפאס",  accent: "#5aa0c0", emoji: "🌉" },
  { code: "de_ancient", name: "Ancient",  he: "אנשיינט",  accent: "#3fae7a", emoji: "🗿" },
  { code: "de_anubis",  name: "Anubis",   he: "אנוביס",   accent: "#c9a227", emoji: "🏺" },
  { code: "de_vertigo", name: "Vertigo",  he: "ורטיגו",   accent: "#9aa7b3", emoji: "🏗️" },
  { code: "de_train",   name: "Train",    he: "טריין",    accent: "#6b7b8c", emoji: "🚆" },
];

// A sentinel meaning "no preference — decide in the lobby".
export const ANY_MAP: MapMeta = { code: "any", name: "Any", he: "כל מפה", accent: "#94a3b8", emoji: "🎲" };

export const MAP_OPTIONS: MapMeta[] = [ANY_MAP, ...CS_MAPS];

export function mapMeta(code?: string | null): MapMeta {
  if (!code) return ANY_MAP;
  return CS_MAPS.find((m) => m.code === code) ?? ANY_MAP;
}
