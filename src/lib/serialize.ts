import type { MatchDTO, MessageDTO, ParticipantDTO } from "./types";

function partDTO(p: any): ParticipantDTO {
  return {
    id: p.id,
    userId: p.userId,
    status: p.status ?? "CONFIRMED",
    outReason: p.outReason ?? null,
    outLate: !!p.outLate,
    username: p.user?.username ?? "שחקן",
    displayName: p.user?.displayName ?? null,
    avatarColor: p.user?.avatarColor ?? "#f59e0b",
    avatarUrl: p.user?.avatarUrl ?? null,
    joinedAt: (p.joinedAt instanceof Date ? p.joinedAt : new Date(p.joinedAt ?? Date.now())).toISOString(),
  };
}

// includeInvite: only pass true for the creator/admin.
export function toMatchDTO(m: any, includeInvite = false): MatchDTO {
  const parts = (m.participants ?? []).map(partDTO) as ParticipantDTO[];
  const byJoin = (a: ParticipantDTO, b: ParticipantDTO) => a.joinedAt.localeCompare(b.joinedAt);
  return {
    id: m.id,
    title: m.title,
    game: m.game,
    scheduledAt: (m.scheduledAt instanceof Date ? m.scheduledAt : new Date(m.scheduledAt)).toISOString(),
    durationMin: m.durationMin ?? 90,
    status: m.status,
    capacity: m.capacity ?? 5,
    discordLink: m.discordLink ?? null,
    notes: m.notes ?? null,
    isPrivate: !!m.isPrivate,
    inviteCode: includeInvite ? m.inviteCode ?? null : null,
    creatorId: m.creatorId,
    creatorName: m.creator?.displayName ?? m.creator?.username ?? "לא ידוע",
    confirmed: parts.filter((p) => p.status === "CONFIRMED").sort(byJoin),
    waitlist: parts.filter((p) => p.status === "WAITLIST").sort(byJoin),
    cancelled: parts.filter((p) => p.status === "OUT").sort(byJoin),
  };
}

export function toMessageDTO(m: any): MessageDTO {
  return {
    id: m.id,
    body: m.body,
    kind: m.kind ?? "USER",
    createdAt: (m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt)).toISOString(),
    userId: m.userId ?? null,
    username: m.user?.displayName ?? m.user?.username ?? "מערכת",
    avatarColor: m.user?.avatarColor ?? "#64748b",
    avatarUrl: m.user?.avatarUrl ?? null,
    isGuest: !!m.user?.isGuest,
  };
}

export const matchInclude = {
  creator: true,
  participants: { include: { user: true }, orderBy: { joinedAt: "asc" as const } },
};
