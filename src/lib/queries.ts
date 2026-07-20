import { prisma } from "@/lib/prisma";
import { matchInclude, toMatchDTO } from "@/lib/serialize";
import type { MatchDTO } from "@/lib/types";
import { attendanceFromParticipations, computeReliability } from "@/lib/reliability";

export async function getUpcomingMatches(limit?: number): Promise<MatchDTO[]> {
  const matches = await prisma.match.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] }, isPrivate: false },
    orderBy: { scheduledAt: "asc" },
    take: limit,
    include: matchInclude,
  });
  return matches.map((m) => toMatchDTO(m));
}

export async function getAllPublicMatches(): Promise<MatchDTO[]> {
  const matches = await prisma.match.findMany({
    where: { isPrivate: false },
    orderBy: { scheduledAt: "asc" },
    include: matchInclude,
  });
  return matches.map((m) => toMatchDTO(m));
}

export async function getMatch(id: string, viewerId?: string): Promise<MatchDTO | null> {
  const m = await prisma.match.findUnique({ where: { id }, include: matchInclude });
  if (!m) return null;
  const isCreator = viewerId && m.creatorId === viewerId;
  return toMatchDTO(m, !!isCreator);
}

export async function getMatchByInvite(code: string): Promise<MatchDTO | null> {
  const m = await prisma.match.findUnique({ where: { inviteCode: code }, include: matchInclude });
  return m ? toMatchDTO(m) : null;
}

// Full profile bundle: user, upcoming, history, attendance + reliability.
export async function getProfileBundle(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const parts = await prisma.participant.findMany({
    where: { userId },
    include: { match: { include: matchInclude } },
    orderBy: { match: { scheduledAt: "desc" } },
  });

  const now = Date.now();
  const upcoming = parts
    .filter((p) => p.status !== "OUT" && new Date(p.match.scheduledAt).getTime() > now && p.match.status !== "CANCELLED")
    .map((p) => toMatchDTO(p.match))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const history = parts
    .filter((p) => new Date(p.match.scheduledAt).getTime() <= now || p.match.status === "COMPLETED")
    .map((p) => ({ match: toMatchDTO(p.match), status: p.status, outLate: p.outLate }));

  const stats = attendanceFromParticipations(
    parts.map((p) => ({ status: p.status, outLate: p.outLate, attendance: p.attendance, match: { status: p.match.status } }))
  );
  const reliability = computeReliability(stats);

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
      role: user.role,
      steamProfile: user.steamProfile,
      discordName: user.discordName,
      elo: user.elo,
      mvpCount: user.mvpCount,
      matchesPlayed: user.matchesPlayed,
    },
    upcoming,
    history,
    stats,
    reliability,
  };
}

export async function getAdminUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const out = [];
  for (const u of users) {
    const parts = await prisma.participant.findMany({
      where: { userId: u.id },
      include: { match: { select: { status: true } } },
    });
    const stats = attendanceFromParticipations(
      parts.map((p) => ({ status: p.status, outLate: p.outLate, attendance: p.attendance, match: { status: p.match.status } }))
    );
    out.push({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarColor: u.avatarColor,
      role: u.role,
      status: u.status,
      chatBanned: u.chatBanned,
      suspendedUntil: u.suspendedUntil ? u.suspendedUntil.toISOString() : null,
      elo: u.elo,
      mvpCount: u.mvpCount,
      matchesPlayed: u.matchesPlayed,
      createdAt: u.createdAt.toISOString(),
      reliability: computeReliability(stats),
      stats,
    });
  }
  return out;
}

export async function getAdminStats() {
  const now = new Date();
  const [users, activeUsers, upcoming, completed, lateCancels, allCancels] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.match.count({ where: { status: "UPCOMING", scheduledAt: { gt: now } } }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.participant.count({ where: { status: "OUT", outLate: true } }),
    prisma.participant.count({ where: { status: "OUT" } }),
  ]);
  return { users, activeUsers, upcoming, completed, lateCancels, allCancels };
}

export async function getAdminCancellations() {
  const parts = await prisma.participant.findMany({
    where: { status: "OUT" },
    orderBy: { joinedAt: "desc" },
    take: 50,
    include: { user: true, match: { select: { title: true, scheduledAt: true } } },
  });
  return parts.map((p) => ({
    id: p.id,
    username: p.user.displayName ?? p.user.username,
    matchTitle: p.match.title,
    reason: p.outReason,
    late: p.outLate,
  }));
}
