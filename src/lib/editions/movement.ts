import type { DraftRanking, RankingEntry, WeeklyEdition } from '../domain/types.ts';

export function previousEntry(previous: WeeklyEdition | null, teamId: string): RankingEntry | null {
  return previous?.entries.find((entry) => entry.teamId === teamId) ?? null;
}

export function rankMovement(
  previous: WeeklyEdition | null,
  teamId: string,
  rank: number,
  draftRanking: DraftRanking | null = null,
): { previousRank: number | null; movement: number | null } {
  const prior = previousEntry(previous, teamId);
  const previousRank =
    draftRanking?.rankings.find((entry) => entry.teamId === teamId)?.rank ?? prior?.rank;
  return {
    previousRank: previousRank ?? null,
    movement: previousRank === undefined ? null : previousRank - rank,
  };
}

export function winningStreak(
  previous: WeeklyEdition | null,
  teamId: string,
  currentWins: number,
): number {
  const prior = previousEntry(previous, teamId);
  if (!prior) return currentWins > 0 ? 1 : 0;
  return currentWins === prior.record.wins + 1 ? prior.winningStreak + 1 : 0;
}
