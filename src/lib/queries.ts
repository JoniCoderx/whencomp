import { prisma } from "@/lib/prisma";
import { matchInclude, toMatchDTO } from "@/lib/serialize";
import type { MatchDTO } from "@/lib/types";

export async function getUpcomingMatches(limit?: number): Promise<MatchDTO[]> {
  const matches = await prisma.match.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] } },
    orderBy: { scheduledAt: "asc" },
    take: limit,
    include: matchInclude,
  });
  return matches.map(toMatchDTO);
}

export async function getAllMatches(): Promise<MatchDTO[]> {
  const matches = await prisma.match.findMany({
    orderBy: { scheduledAt: "asc" },
    include: matchInclude,
  });
  return matches.map(toMatchDTO);
}

export async function getMatch(id: string): Promise<MatchDTO | null> {
  const m = await prisma.match.findUnique({ where: { id }, include: matchInclude });
  return m ? toMatchDTO(m) : null;
}

export async function getLeaderboard(limit = 25) {
  const users = await prisma.user.findMany({
    orderBy: [{ elo: "desc" }, { mvpCount: "desc" }],
    take: limit,
  });
  return users.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
    elo: u.elo,
    mvpCount: u.mvpCount,
    matchesPlayed: u.matchesPlayed,
  }));
}

/**
 * Nemesis = the opponent (different team) this user has faced across the most
 * completed matches. Pure logic, no AI. Returns null when there isn't one yet.
 */
export async function getNemesis(userId: string) {
  const myParts = await prisma.participant.findMany({
    where: { userId, match: { status: "COMPLETED" } },
    include: {
      match: { include: { participants: { include: { user: true } } } },
    },
  });

  const counts = new Map<string, { user: any; count: number }>();
  for (const mp of myParts) {
    for (const opp of mp.match.participants) {
      if (opp.userId === userId) continue;
      if (opp.team === mp.team) continue; // only true opponents
      const entry = counts.get(opp.userId) ?? { user: opp.user, count: 0 };
      entry.count += 1;
      counts.set(opp.userId, entry);
    }
  }

  let best: { user: any; count: number } | null = null;
  for (const e of counts.values()) {
    if (!best || e.count > best.count) best = e;
  }
  if (!best) return null;
  return {
    id: best.user.id,
    username: best.user.username,
    displayName: best.user.displayName,
    avatarColor: best.user.avatarColor,
    elo: best.user.elo,
    encounters: best.count,
  };
}

/** Compute earned trophies from pure stats — no AI. */
export interface Trophy {
  key: string;
  label: string;
  emoji: string;
  desc: string;
  earned: boolean;
}

export function computeTrophies(u: {
  elo: number;
  mvpCount: number;
  matchesPlayed: number;
}): Trophy[] {
  return [
    {
      key: "first-blood",
      label: "First Blood",
      emoji: "🩸",
      desc: "Played your first match",
      earned: u.matchesPlayed >= 1,
    },
    {
      key: "mvp",
      label: "Certified MVP",
      emoji: "⭐",
      desc: "Won at least one MVP",
      earned: u.mvpCount >= 1,
    },
    {
      key: "triple-mvp",
      label: "Triple Threat",
      emoji: "🔥",
      desc: "Won 3+ MVP awards",
      earned: u.mvpCount >= 3,
    },
    {
      key: "veteran",
      label: "Veteran",
      emoji: "🎖️",
      desc: "Played 10+ matches",
      earned: u.matchesPlayed >= 10,
    },
    {
      key: "gold",
      label: "Gold Blooded",
      emoji: "🥇",
      desc: "Reached 1200+ Elo",
      earned: u.elo >= 1200,
    },
    {
      key: "diamond",
      label: "Diamond Hands",
      emoji: "💎",
      desc: "Reached 1400+ Elo",
      earned: u.elo >= 1400,
    },
  ];
}
