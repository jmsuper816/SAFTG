import { describe, expect, it } from 'vitest';
import { commissionerRankingSchema } from '../../src/lib/domain/schemas';

const valid = {
  schemaVersion: 1,
  leagueId: 'league-1',
  season: 2026,
  week: 1,
  commissioner: 'Jess',
  submittedAt: '2026-09-22T12:00:00.000Z',
  rankings: [
    { teamId: '1', rank: 1, explanation: 'Strong opener.' },
    { teamId: '2', rank: 2, explanation: 'Room to grow.' },
  ],
};

describe('commissioner ranking contract', () => {
  it('accepts a complete ordered submission', () =>
    expect(commissionerRankingSchema.parse(valid)).toEqual(valid));
  it.each([
    ['duplicate team', { rankings: [valid.rankings[0], valid.rankings[0]] }],
    ['invalid gap', { rankings: [{ ...valid.rankings[0], rank: 2 }, valid.rankings[1]] }],
    [
      'empty explanation',
      { rankings: [valid.rankings[0], { ...valid.rankings[1], explanation: '' }] },
    ],
    ['week above 25', { week: 26 }],
  ])('rejects %s', (_name, change) =>
    expect(() => commissionerRankingSchema.parse({ ...valid, ...change })).toThrow(),
  );
  it('accepts competition ties', () =>
    expect(() =>
      commissionerRankingSchema.parse({
        ...valid,
        rankings: [
          { ...valid.rankings[0], rank: 1 },
          { ...valid.rankings[1], rank: 1 },
        ],
      }),
    ).not.toThrow());
});
