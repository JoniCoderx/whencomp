export interface ParticipantDTO {
  id: string;
  userId: string;
  team: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  elo: number;
}

export interface MatchDTO {
  id: string;
  title: string;
  game: string;
  scheduledAt: string;
  status: string;
  discordLink: string | null;
  maxPlayers: number;
  notes: string | null;
  creatorId: string;
  creatorName: string;
  participants: ParticipantDTO[];
}

export interface ProfileDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarColor: string;
  elo: number;
  mvpCount: number;
  matchesPlayed: number;
}
