// Production-safe roster bootstrap. Runs on every container start (see
// Dockerfile CMD). Idempotent: creates the preset players if missing, and
// keeps their Steam link + captain/admin flag in sync WITHOUT overwriting a
// player's own later edits (display name / password stay theirs).

// @prisma/client is CommonJS — use default import for reliable ESM interop on Node 20.
import pkg from "@prisma/client";
import bcrypt from "bcryptjs";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Default password for preset accounts (players should change it after login).
const DEFAULT_PASSWORD = process.env.ROSTER_PASSWORD || "cs2play";

const COLORS = ["#f59e0b", "#ff4655", "#84cc16", "#22d3ee", "#fbbf24", "#8b5cf6", "#f472b6"];

// Order matters — the first entry is the captain (pinned on top, admin).
const ROSTER = [
  { username: "HackerMotherFucker", display: "HackerMotherFucker", steam: "https://steamcommunity.com/id/HackerMotherFucker", captain: true },
  { username: "ChutmarikaIL",       display: "ChutmarikaIL",       steam: "https://steamcommunity.com/id/ChutmarikaIL" },
  { username: "HextoN_O",           display: "HextoN_O",           steam: "https://steamcommunity.com/id/HextoN_O" },
  { username: "Negroniko",          display: "Negroniko",          steam: "https://steamcommunity.com/id/Negroniko" },
  { username: "player_414396",      display: "Player 414396",      steam: "https://steamcommunity.com/profiles/76561198169414396" },
  { username: "player_898544",      display: "Player 898544",      steam: "https://steamcommunity.com/profiles/76561198830898544" },
  { username: "player_502816",      display: "Player 502816",      steam: "https://steamcommunity.com/profiles/76561198227502816" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (let i = 0; i < ROSTER.length; i++) {
    const r = ROSTER[i];
    await prisma.user.upsert({
      where: { username: r.username },
      // Keep the player's own edits; only ensure Steam link + captain role.
      update: {
        steamProfile: r.steam,
        ...(r.captain ? { role: "ADMIN" } : {}),
      },
      create: {
        username: r.username,
        displayName: r.display,
        passwordHash,
        steamProfile: r.steam,
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
