import { describe, expect, it } from 'vitest';
import { evaluateBadges } from '../../src/lib/badges/evaluate';
import type { Matchup, RankingEntry } from '../../src/lib/domain/types';

const entries: RankingEntry[] = [
  {
    teamId: '1',
    displayName: 'Owls',
    rank: 2,
    previousRank: 3,
    movement: 1,
    record: { wins: 2, losses: 0, ties: 0, pointsFor: 220, pointsAgainst: 150 },
    weeklyScore: 120,
    winningStreak: 2,
    explanation: 'Hot',
    badgeIds: [],
  },
  {
    teamId: '2',
    displayName: 'Sharks',
    rank: 1,
    previousRank: 1,
    movement: 0,
    record: { wins: 1, losses: 1, ties: 0, pointsFor: 190, pointsAgainst: 200 },
    weeklyScore: 90,
    winningStreak: 0,
    explanation: 'Cold',
    badgeIds: [],
  },
];
const matchups: Matchup[] = [
  {
    matchupId: '1',
    homeTeamId: '1',
    awayTeamId: '2',
    homeScore: 120,
    awayScore: 90,
    winnerTeamId: '1',
    isFinal: true,
  },
];

describe('badges', () => {
  it('awards all seven qualifying badge types deterministically', () => {
    const ids = evaluateBadges(entries, matchups).map((award) => award.badgeId);
    expect(ids).toEqual(
      expect.arrayContaining([
        'scoreboard-scorcher',
        'basement-dweller',
        'steamroller',
        'photo-finish',
        'giant-slayer',
        'hot-streak',
        'hard-luck-hero',
      ]),
    );
  });
  it('awards tied extrema to all teams', () => {
    const tied = entries.map((entry) => ({ ...entry, weeklyScore: 100, winningStreak: 2 }));
    const awards = evaluateBadges(tied, [
      { ...matchups[0]!, homeScore: 100, awayScore: 100, winnerTeamId: null },
    ]);
    expect(awards.filter((award) => award.badgeId === 'scoreboard-scorcher')).toHaveLength(2);
    expect(awards.filter((award) => award.badgeId === 'hot-streak')).toHaveLength(2);
  });
  it('omits matchup badges when no team wins', () =>
    expect(
      evaluateBadges(entries, [{ ...matchups[0]!, winnerTeamId: null }]).some(
        (award) => award.badgeId === 'steamroller',
      ),
    ).toBe(false));
});
