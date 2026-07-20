import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GAMES = ["CS2", "Valorant", "COD"];
const COLORS = ["#3b82f6", "#a855f7", "#22d3ee", "#ec4899", "#a3e635", "#f59e0b"];

async function main() {
  console.log("🌱 Seeding When Comp database...");

  // Reset (idempotent seed)
  await prisma.rating.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const usernames = [
    "Neo",
    "Viper",
    "Ghost",
    "Blaze",
    "Nova",
    "Rogue",
    "Phantom",
    "Ace",
  ];

  const users = [];
  for (let i = 0; i < usernames.length; i++) {
    const u = await prisma.user.create({
      data: {
        username: usernames[i],
        displayName: usernames[i],
        passwordHash,
        avatarColor: COLORS[i % COLORS.length],
        elo: 900 + Math.round((i * 137) % 400),
        mvpCount: (i * 3) % 7,
        matchesPlayed: 5 + ((i * 7) % 20),
      },
    });
    users.push(u);
  }

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Upcoming matches
  const upcoming = [
    { title: "Friday Night Rush", game: "CS2", offset: 1 * dayMs, hour: 21 },
    { title: "Ranked Grind", game: "Valorant", offset: 2 * dayMs, hour: 20 },
    { title: "Warzone Squad", game: "COD", offset: 3 * dayMs, hour: 22 },
    { title: "Scrim Practice", game: "CS2", offset: 4 * dayMs, hour: 19 },
  ];

  for (let i = 0; i < upcoming.length; i++) {
    const m = upcoming[i];
    const date = new Date(now.getTime() + m.offset);
    date.setHours(m.hour, 0, 0, 0);
    const match = await prisma.match.create({
      data: {
        title: m.title,
        game: m.game,
        scheduledAt: date,
        status: "UPCOMING",
        discordLink: "https://discord.gg/example",
        maxPlayers: 10,
        creatorId: users[i % users.length].id,
      },
    });
    // add a few participants
    const joiners = users.slice(0, 3 + (i % 4));
    for (let j = 0; j < joiners.length; j++) {
      await prisma.participant.create({
        data: {
          userId: joiners[j].id,
          matchId: match.id,
          team: j % 2 === 0 ? "A" : "B",
        },
      });
    }
  }

  // A completed match (so post-match / trophies have data)
  const past = new Date(now.getTime() - 1 * dayMs);
  past.setHours(21, 0, 0, 0);
  const completed = await prisma.match.create({
    data: {
      title: "Last Night's Clash",
      game: "CS2",
      scheduledAt: past,
      status: "COMPLETED",
      maxPlayers: 10,
      creatorId: users[0].id,
    },
  });
  const playedUsers = users.slice(0, 6);
  for (let j = 0; j < playedUsers.length; j++) {
    await prisma.participant.create({
      data: {
        userId: playedUsers[j].id,
        matchId: completed.id,
        team: j % 2 === 0 ? "A" : "B",
        fpsRating: 3 + (j % 3),
        mvpVoteId: playedUsers[0].id,
      },
    });
  }
  await prisma.rating.create({
    data: {
      kind: "MVP",
      value: 1,
      matchId: completed.id,
      fromUserId: playedUsers[1].id,
      toUserId: playedUsers[0].id,
    },
  });

  console.log(`✅ Seeded ${users.length} users and ${upcoming.length + 1} matches.`);
  console.log("👉 Try logging in as 'Neo' / 'password123'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
