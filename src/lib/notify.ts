import { prisma } from "@/lib/prisma";

// Create in-app notifications for a set of users (skips one optional user).
export async function notifyUsers(
  userIds: string[],
  kind: string,
  body: string,
  matchId?: string,
  exceptUserId?: string
) {
  const targets = Array.from(new Set(userIds)).filter((id) => id !== exceptUserId);
  if (!targets.length) return;
  await prisma.notification.createMany({
    data: targets.map((userId) => ({ userId, kind, body, matchId: matchId ?? null })),
  });
}

// Post an automatic SYSTEM message into a match chat.
export async function systemMessage(matchId: string, body: string) {
  await prisma.message.create({ data: { matchId, body, kind: "SYSTEM", userId: null } });
}

export async function participantUserIds(matchId: string): Promise<string[]> {
  const parts = await prisma.participant.findMany({
    where: { matchId, status: { in: ["CONFIRMED", "WAITLIST"] } },
    select: { userId: true },
  });
  return parts.map((p) => p.userId);
}
