import { prisma } from "@/lib/prisma";
import { matchInclude, toMatchDTO } from "@/lib/serialize";
import type { MatchDTO } from "@/lib/types";
import { attendanceFromParticipations, computeReliability } from "@/lib/reliability";

// Run a read; on failure (DB hiccup / cold start) return a safe fallback so the
// page renders an empty state instead of white-screening.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("query failed, using fallback:", (e as Error)?.message);
    return fallback;
  }
}

// A comp is "over" once its start + duration has fully passed, or it was
// completed/cancelled. Over comps are dropped from the boards so the home page
// only ever shows what's still relevant.
function isOver(m: { scheduledAt: string | Date; durationMin?: number | null; status: string }): boolean {
  if (m.status === "COMPLETED" || m.status === "CANCELLED") return true;
  const end = new Date(m.scheduledAt).getTime() + (m.durationMin ?? 90) * 60000;
  return Date.now() > end;
}

export async function getUpcomingMatches(limit?: number): Promise<MatchDTO[]> {
  return safe(async () => {
    const matches = await prisma.match.findMany({
      where: { status: { in: ["UPCOMING", "LIVE"] }, isPrivate: false },
      orderBy: { scheduledAt: "asc" },
      include: matchInclude,
    });
    // Drop comps whose time already passed, then apply the limit.
    const live = matches.map((m) => toMatchDTO(m)).filter((m) => !isOver(m));
    return typeof limit === "number" ? live.slice(0, limit) : live;
  }, []);
}

export async function getAllPublicMatches(): Promise<MatchDTO[]> {
  return safe(async () => {
    const matches = await prisma.match.findMany({
      where: { isPrivate: false },
      orderBy: { scheduledAt: "asc" },
      include: matchInclude,
    });
    return matches.map((m) => toMatchDTO(m)).filter((m) => !isOver(m));
  }, []);
}

export async function getMatch(id: string, viewerId?: string, inviteCode?: string): Promise<MatchDTO | null> {
  return safe(async () => {
    const m = await prisma.match.findUnique({ where: { id }, include: matchInclude });
    if (!m) return null;
    const isCreator = !!viewerId && m.creatorId === viewerId;
    // Private comps are visible only to the creator, current participants, or
    // anyone holding the invite link (?invite=CODE).
    if (m.isPrivate && !isCreator) {
      const isParticipant =
        !!viewerId && (m.participants ?? []).some((p: any) => p.userId === viewerId && p.status !== "OUT");
      const invited = !!inviteCode && !!m.inviteCode && inviteCode === m.inviteCode;
      if (!isParticipant && !invited) return null;
    }
    return toMatchDTO(m, isCreator);
  }, null);
}

// Whether a viewer may see a match's contents (page, chat, ICS). Public matches
// are visible to everyone; private ones only to the creator, a current
// participant, or a holder of the invite code.
export async function canViewMatch(matchId: string, viewerId?: string, inviteCode?: string): Promise<boolean> {
  try {
    const m = await prisma.match.findUnique({
      where: { id: matchId },
      select: { isPrivate: true, creatorId: true, inviteCode: true, participants: { select: { userId: true, status: true } } },
    });
    if (!m) return false;
    if (!m.isPrivate) return true;
    if (viewerId && m.creatorId === viewerId) return true;
    if (viewerId && m.participants.some((p) => p.userId === viewerId && p.status !== "OUT")) return true;
    if (inviteCode && m.inviteCode && inviteCode === m.inviteCode) return true;
    return false;
  } catch {
    return false;
  }
}

export async function getMatchByInvite(code: string): Promise<MatchDTO | null> {
  return safe(async () => {
    const m = await prisma.match.findUnique({ where: { inviteCode: code }, include: matchInclude });
    return m ? toMatchDTO(m) : null;
  }, null);
}

// Full profile bundle: user, upcoming, history, attendance + reliability.
export async function getProfileBundle(userId: string) {
  return safe(() => profileBundleInner(userId), null);
}

async function profileBundleInner(userId: string) {
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
      avatarUrl: user.avatarUrl,
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

// Team roster ranked by community votes ("top scores"). viewerId marks which
// players the current user has already voted for.
export async function getRoster(viewerId?: string) {
  return safe(() => rosterInner(viewerId), [] as any[]);
}

async function rosterInner(viewerId?: string) {
  const { CAPTAIN_USERNAME } = await import("@/lib/config");
  // Real roster only — never list anonymous guest accounts.
  const users = await prisma.user.findMany({ where: { status: "ACTIVE", isGuest: false } });

  const [voteGroups, myVotes] = await Promise.all([
    prisma.playerVote.groupBy({ by: ["targetId"], _count: { targetId: true } }),
    viewerId
      ? prisma.playerVote.findMany({ where: { voterId: viewerId }, select: { targetId: true } })
      : Promise.resolve([]),
  ]);
  const votesByTarget = new Map(voteGroups.map((g) => [g.targetId, g._count.targetId]));
  const myVoted = new Set(myVotes.map((v) => v.targetId));

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
      avatarUrl: u.avatarUrl,
      role: u.role,
      steamProfile: u.steamProfile,
      discordName: u.discordName,
      matchesPlayed: u.matchesPlayed,
      isCaptain: u.username === CAPTAIN_USERNAME,
      votes: votesByTarget.get(u.id) ?? 0,
      votedByMe: myVoted.has(u.id),
      reliability: computeReliability(stats),
    });
  }
  // Top scores: most votes first, then matches, captain wins ties.
  out.sort((a, b) => b.votes - a.votes || b.matchesPlayed - a.matchesPlayed || (a.isCaptain ? -1 : 1));
  return out;
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
      avatarUrl: u.avatarUrl,
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
