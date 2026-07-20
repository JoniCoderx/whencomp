import type { MatchDTO } from "./types";

// Shape of the Prisma query result we serialize from.
type MatchWithRelations = any;

export function toMatchDTO(m: MatchWithRelations): MatchDTO {
  return {
    id: m.id,
    title: m.title,
    game: m.game,
    scheduledAt: (m.scheduledAt instanceof Date
      ? m.scheduledAt
      : new Date(m.scheduledAt)
    ).toISOString(),
    status: m.status,
    discordLink: m.discordLink ?? null,
    maxPlayers: m.maxPlayers,
    notes: m.notes ?? null,
    creatorId: m.creatorId,
    creatorName: m.creator?.displayName ?? m.creator?.username ?? "Unknown",
    participants: (m.participants ?? []).map((p: any) => ({
      id: p.id,
      userId: p.userId,
      team: p.team,
      username: p.user?.username ?? "player",
      displayName: p.user?.displayName ?? null,
      avatarColor: p.user?.avatarColor ?? "#3b82f6",
      elo: p.user?.elo ?? 1000,
    })),
  };
}

export const matchInclude = {
  creator: true,
  participants: { include: { user: true }, orderBy: { joinedAt: "asc" as const } },
};
