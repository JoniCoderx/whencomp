// Production-safe roster bootstrap. Runs on every container start (see
// Dockerfile CMD). Idempotent: creates the preset players if missing, and
// keeps their canonical display name, Steam link, captain/admin flag and
// (when provided) avatar in sync on every boot. The display names below are
// the owner-dictated roster names and are enforced even on existing accounts.

// @prisma/client is CommonJS — use default import for reliable ESM interop on Node 20.
import pkg from "@prisma/client";
import bcrypt from "bcryptjs";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Default password for preset accounts (players should change it after login).
const DEFAULT_PASSWORD = process.env.ROSTER_PASSWORD || "cs2play";

const COLORS = ["#f59e0b", "#ff4655", "#84cc16", "#22d3ee", "#fbbf24", "#8b5cf6", "#f472b6"];

// Order matters — the first entry is the captain (pinned on top, admin).
// `avatar` = direct image URL (e.g. the Steam avatar). Leave "" to fall back
// to a coloured-initials avatar. Fill these in to show real profile pictures.
const ROSTER = [
  { username: "HackerMotherFucker", display: "Sharmuta #1",        steam: "https://steamcommunity.com/id/HackerMotherFucker", avatar: "", captain: true },
  { username: "ChutmarikaIL",       display: "ChutMarika!",        steam: "https://steamcommunity.com/id/ChutmarikaIL",        avatar: "" },
  { username: "HextoN_O",           display: "HextoN",             steam: "https://steamcommunity.com/id/HextoN_O",            avatar: "" },
  { username: "Negroniko",          display: "Negroni",            steam: "https://steamcommunity.com/id/Negroniko",           avatar: "" },
  { username: "player_414396",      display: "Audi A1 2013 1.4T",  steam: "https://steamcommunity.com/profiles/76561198169414396", avatar: "" },
  { username: "player_898544",      display: "Hassan Nasrallah",   steam: "https://steamcommunity.com/profiles/76561198830898544", avatar: "" },
  { username: "player_502816",      display: "סמדי בומבה פרימום",  steam: "https://steamcommunity.com/profiles/76561198227502816", avatar: "" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (let i = 0; i < ROSTER.length; i++) {
    const r = ROSTER[i];
    await prisma.user.upsert({
      where: { username: r.username },
      // Enforce the canonical roster name + Steam link + captain role, and
      // (when provided) the roster avatar — on existing accounts too.
      update: {
        displayName: r.display,
        steamProfile: r.steam,
        ...(r.captain ? { role: "ADMIN" } : {}),
        ...(r.avatar ? { avatarUrl: r.avatar } : {}),
      },
      create: {
        username: r.username,
        displayName: r.display,
        passwordHash,
        steamProfile: r.steam,
        avatarUrl: r.avatar || null,
        role: r.captain ? "ADMIN" : "USER",
        avatarColor: COLORS[i % COLORS.length],
        elo: 1000,
      },
    });
  }
  console.log(`✅ Roster bootstrap: ${ROSTER.length} players ensured (captain: ${ROSTER[0].username}).`);
}

main()
  .catch((e) => {
    // Never block startup on a bootstrap hiccup.
    console.error("Roster bootstrap failed (continuing):", e?.message ?? e);
  })
  .finally(() => prisma.$disconnect());
