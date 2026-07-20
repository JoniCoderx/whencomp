export interface ParticipantDTO {
  id: string;
  userId: string;
  status: string; // CONFIRMED | WAITLIST | OUT
  outReason: string | null;
  outLate: boolean;
  username: string;
  displayName: string | null;
  avatarColor: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface MatchDTO {
  id: string;
  title: string;
  game: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  capacity: number;
  discordLink: string | null;
  notes: string | null;
  isPrivate: boolean;
  inviteCode: string | null;
  creatorId: string;
  creatorName: string;
  confirmed: ParticipantDTO[];
  waitlist: ParticipantDTO[];
  cancelled: ParticipantDTO[];
}

export interface MessageDTO {
  id: string;
  body: string;
  kind: string; // USER | SYSTEM
  createdAt: string;
  userId: string | null;
  username: string;
  avatarColor: string;
  avatarUrl: string | null;
}

export interface NotificationDTO {
  id: string;
  kind: string;
  body: string;
  read: boolean;
  createdAt: string;
  matchId: string | null;
}

export interface ProfileDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  avatarUrl: string | null;
  role: string;
  steamProfile: string | null;
  discordName: string | null;
  elo: number;
  mvpCount: number;
  matchesPlayed: number;
}

export interface AdminUserDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  role: string;
  status: string;
  chatBanned: boolean;
  suspendedUntil: string | null;
  elo: number;
  mvpCount: number;
  matchesPlayed: number;
  createdAt: string;
}
