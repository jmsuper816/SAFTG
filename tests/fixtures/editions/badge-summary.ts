import type { WeeklyEdition } from '../../../src/lib/domain/types';

export function badgeSummaryEdition(): WeeklyEdition {
  return {
    schemaVersion: 1,
    editionId: 'league-1-2026-week-01',
    league: {
      leagueId: 'league-1',
      name: 'Tuesday League',
      season: 2026,
      timezone: 'America/New_York',
    },
    week: {
      number: 1,
      startsAt: '2026-09-01T00:00:00.000Z',
      endsAt: '2026-09-08T00:00:00.000Z',
      sourceStatus: 'final',
    },
    publishedAt: '2026-09-08T16:00:00.000Z',
    rankingSource: {
      type: 'commissioner',
      commissioner: 'ESPN Power Rankings',
      submissionPath: 'data/rankings/2026/week-01.json',
    },
    entries: [
      entry('1', 'A'.repeat(60), 1, ['scoreboard-scorcher', 'hot-streak']),
      entry('2', 'Sunday Sharks', 2, ['scoreboard-scorcher']),
      entry('3', 'Tuesday Tigers', 2, ['basement-dweller']),
    ],
    badges: [
      award('basement-dweller', '3', 'Posted the low score.'),
      award('scoreboard-scorcher', '2', 'Tied for the high score.'),
      award('hot-streak', '1', 'Extended a winning streak.'),
      award('scoreboard-scorcher', '1', 'Tied for the high score.'),
    ],
    previousEditionId: null,
  };
}

function entry(teamId: string, displayName: string, rank: number, badgeIds: string[]) {
  return {
    teamId,
    displayName,
    rank,
    previousRank: null,
    movement: null,
    record: { wins: 1, losses: 0, ties: 0, pointsFor: 100, pointsAgainst: 90 },
    weeklyScore: 100,
    winningStreak: 1,
    explanation: 'A'.repeat(500),
    badgeIds,
  };
}

function award(badgeId: string, teamId: string, reason: string) {
  return { badgeId, teamId, reason, metric: 1 };
}
