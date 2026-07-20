import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const COLORS = ["#f59e0b", "#ff4655", "#84cc16", "#22d3ee", "#fbbf24", "#8b5cf6", "#f472b6"];

async function main() {
  console.log("🌱 Seeding When Comp (dev)...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);
  const names = ["Neo", "Viper", "Ghost", "Blaze", "Nova", "Rogue", "Ace", "Storm"];
  const users = [];
  for (let i = 0; i < names.length; i++) {
    users.push(
      await prisma.user.create({
        data: {
          username: names[i],
          displayName: names[i],
          passwordHash: hash,
          role: i === 0 ? "ADMIN" : "USER",
          avatarColor: COLORS[i % COLORS.length],
          discordName: `${names[i]}#${1000 + i}`,
          elo: 900 + ((i * 137) % 500),
          matchesPlayed: 4 + ((i * 5) % 15),
        },
      })
    );
  }

  const now = Date.now();
  const day = 86400000;
  const comps = [
    { title: "קומפ ליל שלישי", off: 2 * day, hour: 22, confirmed: 4, wait: 0 },
    { title: "מסיבת ריטייק", off: 3 * day, hour: 21, confirmed: 5, wait: 2 },
    { title: "פרימיר גראיינד", off: 1 * day, hour: 23, confirmed: 3, wait: 0 },
    { title: "אימון ערב", off: 4 * day, hour: 20, confirmed: 2, wait: 0 },
  ];

  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    const date = new Date(now + c.off);
    date.setHours(c.hour, 0, 0, 0);
    const match = await prisma.match.create({
      data: {
        title: c.title,
        game: "CS2",
        scheduledAt: date,
        status: "UPCOMING",
        capacity: 5,
        discordLink: i % 2 === 0 ? "https://discord.gg/example" : null,
        notes: i === 0 ? "מפה ראשונה מיראז׳ 🗺️" : null,
        creatorId: users[i % users.length].id,
      },
    });
    let idx = 0;
    for (let j = 0; j < c.confirmed; j++, idx++)
      await prisma.participant.create({ data: { userId: users[idx].id, matchId: match.id, status: "CONFIRMED" } });
    for (let j = 0; j < c.wait; j++, idx++)
      await prisma.participant.create({ data: { userId: users[idx].id, matchId: match.id, status: "WAITLIST" } });

    await prisma.message.create({ data: { matchId: match.id, kind: "SYSTEM", body: `${users[0].username} פתח/ה את הקומפ` } });
    await prisma.message.create({ data: { matchId: match.id, userId: users[0].id, body: "מי בפנים? 🎮" } });
    await prisma.message.create({ data: { matchId: match.id, userId: users[1].id, body: "אני! נשמור מקום" } });
  }

  // completed comp for history / survey demo
  const past = new Date(now - day);
  past.setHours(22, 0, 0, 0);
  const done = await prisma.match.create({
    data: { title: "הקרב של אתמול", game: "CS2", scheduledAt: past, status: "COMPLETED", capacity: 5, creatorId: users[0].id },
  });
  for (let j = 0; j < 5; j++)
    await prisma.participant.create({
      data: { userId: users[j].id, matchId: done.id, status: "CONFIRMED", attendance: j === 4 ? "NOSHOW" : "ARRIVED", mvpVoteId: users[0].id, fpsRating: 4 },
    });

  await prisma.notification.create({ data: { userId: users[0].id, kind: "FULL", body: "הקומפ 'מסיבת ריטייק' התמלא", matchId: null } });

  console.log(`✅ ${users.length} users, ${comps.length + 1} comps.`);
  console.log("👑 Admin: Neo / password123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
