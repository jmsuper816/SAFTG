import { describe, expect, it } from 'vitest';
import { rankMovement, winningStreak } from '../../src/lib/editions/movement';
import { validEdition } from '../contract/edition.test';
import type { WeeklyEdition } from '../../src/lib/domain/types';
import type { DraftRanking } from '../../src/lib/domain/types';

const previous = validEdition as unknown as WeeklyEdition;
describe('ranking movement', () => {
  it('returns null for a first appearance', () =>
    expect(rankMovement(null, '1', 1)).toEqual({ previousRank: null, movement: null }));
  it('reports rise, fall, and unchanged movement', () => {
    expect(rankMovement(previous, '2', 1).movement).toBe(1);
    expect(rankMovement(previous, '1', 2).movement).toBe(-1);
    expect(rankMovement(previous, '1', 1).movement).toBe(0);
  });
  it('uses stable IDs across display name changes', () =>
    expect(rankMovement(previous, '1', 2).previousRank).toBe(1));
  it('uses draft-day rankings when no weekly edition exists', () => {
    const draftRanking: DraftRanking = {
      schemaVersion: 1,
      leagueId: 'league-1',
      season: 2026,
      label: 'Draft Day Power Rankings',
      rankings: [
        { teamId: '1', displayName: 'Old team name', rank: 2 },
        { teamId: '2', displayName: 'Other team', rank: 1 },
      ],
    };
    expect(rankMovement(null, '1', 1, draftRanking)).toEqual({ previousRank: 2, movement: 1 });
    expect(rankMovement(previous, '1', 2, draftRanking)).toEqual({
      previousRank: 2,
      movement: 0,
    });
  });
  it('increments or resets winning streaks', () => {
    expect(winningStreak(previous, '1', 2)).toBe(2);
    expect(winningStreak(previous, '1', 1)).toBe(0);
  });
});
