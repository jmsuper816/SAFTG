export interface RecordSummary {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Team {
  teamId: string;
  displayName: string;
  abbreviation: string | null;
  logoUrl: string | null;
  record: RecordSummary;
}

export interface Matchup {
  matchupId: string;
  homeTeamId: string;
  awayTeamId: string | null;
  homeScore: number;
  awayScore: number | null;
  winnerTeamId: string | null;
  isFinal: boolean;
}

export interface EspnWeekSnapshot {
  league: { leagueId: string; name: string; season: number; timezone?: string };
  status: { week: number; isFinal: boolean; startsAt: string; endsAt: string };
  teams: Team[];
  matchups: Matchup[];
}

export interface RankingSubmission {
  teamId: string;
  rank: number;
  explanation: string;
}

export interface CommissionerRanking {
  schemaVersion: 1;
  leagueId: string;
  season: number;
  week: number;
  commissioner: string;
  submittedAt: string;
  rankings: RankingSubmission[];
}

export interface DraftRanking {
  schemaVersion: 1;
  leagueId: string;
  season: number;
  label: string;
  rankings: Array<{
    teamId: string;
    displayName: string;
    rank: number;
  }>;
}

export type BadgeScope = 'weekly' | 'streak';
export type BadgeTieRule = 'all' | 'none' | 'secondary';

export interface BadgeDefinition {
  badgeId: string;
  name: string;
  description: string;
  scope: BadgeScope;
  exclusive: boolean;
  tieRule: BadgeTieRule;
  assetPath: string;
}

export interface BadgeAward {
  badgeId: string;
  teamId: string;
  reason: string;
  metric: number | null;
}

export interface RankingEntry {
  teamId: string;
  displayName: string;
  rank: number;
  previousRank: number | null;
  movement: number | null;
  record: RecordSummary;
  weeklyScore: number;
  winningStreak: number;
  explanation: string;
  badgeIds: string[];
}

export interface WeeklyEdition {
  schemaVersion: 1;
  editionId: string;
  league: { leagueId: string; name: string; season: number; timezone: string };
  week: { number: number; startsAt: string; endsAt: string; sourceStatus: 'final' };
  publishedAt: string;
  rankingSource: { type: 'commissioner'; commissioner: string; submissionPath: string };
  entries: RankingEntry[];
  badges: BadgeAward[];
  previousEditionId: string | null;
}
