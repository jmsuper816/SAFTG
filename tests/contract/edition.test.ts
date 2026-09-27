import { describe, expect, it } from 'vitest';
import { editionSchema } from '../../src/lib/domain/schemas';

export const validEdition = {
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
    commissioner: 'Jess',
    submissionPath: 'data/rankings/2026/week-01.json',
  },
  entries: [
    {
      teamId: '1',
      displayName: 'Gridiron Owls',
      rank: 1,
      previousRank: null,
      movement: null,
      record: { wins: 1, losses: 0, ties: 0, pointsFor: 120, pointsAgainst: 90 },
      weeklyScore: 120,
      winningStreak: 1,
      explanation: 'Strong opener.',
      badgeIds: [],
    },
    {
      teamId: '2',
      displayName: 'Sunday Sharks',
      rank: 2,
      previousRank: null,
      movement: null,
      record: { wins: 0, losses: 1, ties: 0, pointsFor: 90, pointsAgainst: 120 },
      weeklyScore: 90,
      winningStreak: 0,
      explanation: 'Room to grow.',
      badgeIds: [],
    },
  ],
  badges: [],
  previousEditionId: null,
} as const;

describe('edition contract', () => {
  it('accepts a complete final edition', () =>
    expect(() => editionSchema.parse(validEdition)).not.toThrow());
  it('rejects duplicate teams', () =>
    expect(() =>
      editionSchema.parse({
        ...validEdition,
        entries: [validEdition.entries[0], validEdition.entries[0]],
      }),
    ).toThrow());
  it('rejects badge awards for unknown teams', () =>
    expect(() =>
      editionSchema.parse({
        ...validEdition,
        badges: [{ badgeId: 'top-score', teamId: 'nope', reason: 'Nope', metric: 1 }],
      }),
    ).toThrow());
  it('rejects unknown catalog badge IDs', () =>
    expect(() =>
      editionSchema.parse({
        ...validEdition,
        entries: [
          { ...validEdition.entries[0], badgeIds: ['unknown-badge'] },
          validEdition.entries[1],
        ],
        badges: [{ badgeId: 'unknown-badge', teamId: '1', reason: 'Unknown.', metric: null }],
      }),
    ).toThrow(/Unknown badge/));
  it('rejects duplicate badge and team awards', () => {
    const award = {
      badgeId: 'scoreboard-scorcher',
      teamId: '1',
      reason: 'High score.',
      metric: 120,
    };
    expect(() =>
      editionSchema.parse({
        ...validEdition,
        entries: [
          { ...validEdition.entries[0], badgeIds: ['scoreboard-scorcher'] },
          validEdition.entries[1],
        ],
        badges: [award, award],
      }),
    ).toThrow(/Duplicate badge award/);
  });
  it('rejects disagreement between awards and entry badge IDs', () =>
    expect(() =>
      editionSchema.parse({
        ...validEdition,
        entries: [
          { ...validEdition.entries[0], badgeIds: ['scoreboard-scorcher'] },
          validEdition.entries[1],
        ],
        badges: [],
      }),
    ).toThrow(/Badge references disagree/));
  it('rejects non-final source status', () =>
    expect(() =>
      editionSchema.parse({
        ...validEdition,
        week: { ...validEdition.week, sourceStatus: 'pending' },
      }),
    ).toThrow());
});
