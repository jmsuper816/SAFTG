import { describe, expect, it } from 'vitest';
import { normalizeEdition } from '../../src/lib/editions/normalize';
import { normalizeEspnResponse } from '../../src/lib/espn/normalize';
import { espnFixture, incompleteFixture } from '../fixtures/espn/factory';
import type { CommissionerRanking, DraftRanking } from '../../src/lib/domain/types';

const ranking: CommissionerRanking = {
  schemaVersion: 1,
  leagueId: 'league-1',
  season: 2026,
  week: 1,
  commissioner: 'Jess',
  submittedAt: '2026-09-08T12:00:00.000Z',
  rankings: [
    { teamId: '1', rank: 1, explanation: 'Strong.' },
    { teamId: '2', rank: 2, explanation: 'Next.' },
  ],
};
const request = { leagueId: 'league-1', season: 2026, week: 1, timezone: 'America/New_York' };
const options = {
  timezone: 'America/New_York',
  submissionPath: 'data/rankings/2026/week-01.json',
  publishedAt: '2026-09-08T16:00:00.000Z',
  previous: null,
};

describe('edition generation', () => {
  it('is deterministic for identical inputs', () => {
    const snapshot = normalizeEspnResponse(espnFixture(), request);
    expect(normalizeEdition(ranking, snapshot, options)).toEqual(
      normalizeEdition(ranking, snapshot, options),
    );
  });
  it('rejects incomplete results', () =>
    expect(() =>
      normalizeEdition(ranking, normalizeEspnResponse(incompleteFixture(), request), options),
    ).toThrow(/not final/));
  it('rejects missing team coverage', () =>
    expect(() =>
      normalizeEdition(
        { ...ranking, rankings: ranking.rankings.slice(0, 1) },
        normalizeEspnResponse(espnFixture(), request),
        options,
      ),
    ).toThrow(/every active team/));
  it('rejects mismatched source metadata', () =>
    expect(() =>
      normalizeEdition(
        { ...ranking, week: 2 },
        normalizeEspnResponse(espnFixture(), request),
        options,
      ),
    ).toThrow(/do not match/));
  it('compares the first weekly edition with the complete draft-day baseline', () => {
    const draftRanking: DraftRanking = {
      schemaVersion: 1,
      leagueId: 'league-1',
      season: 2026,
      label: 'Draft Day Power Rankings',
      rankings: [
        { teamId: '2', displayName: 'Second Team', rank: 1 },
        { teamId: '1', displayName: 'First Team', rank: 2 },
      ],
    };
    const edition = normalizeEdition(ranking, normalizeEspnResponse(espnFixture(), request), {
      ...options,
      draftRanking,
    });
    expect(
      edition.entries.map(({ previousRank, movement }) => ({ previousRank, movement })),
    ).toEqual([
      { previousRank: 2, movement: 1 },
      { previousRank: 1, movement: -1 },
    ]);
  });
  it('rejects an incomplete draft-day baseline', () => {
    const draftRanking: DraftRanking = {
      schemaVersion: 1,
      leagueId: 'league-1',
      season: 2026,
      label: 'Draft Day Power Rankings',
      rankings: [{ teamId: '1', displayName: 'First Team', rank: 1 }],
    };
    expect(() =>
      normalizeEdition(ranking, normalizeEspnResponse(espnFixture(), request), {
        ...options,
        draftRanking,
      }),
    ).toThrow(/every active team/);
  });
});
