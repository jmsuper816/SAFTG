import { describe, expect, it, vi } from 'vitest';
import { EspnError, fetchEspnLeague } from '../../src/lib/espn/client';
import { normalizeEspnResponse } from '../../src/lib/espn/normalize';
import {
  duplicateTeamFixture,
  espnFixture,
  incompleteFixture,
  renamedTeamFixture,
} from '../fixtures/espn/factory';

const requested = { leagueId: 'league-1', season: 2026, week: 1, timezone: 'America/New_York' };
describe('ESPN adapter', () => {
  it('normalizes a finalized public week', () =>
    expect(normalizeEspnResponse(espnFixture(), requested).status.isFinal).toBe(true));
  it('preserves identity across rename', () =>
    expect(normalizeEspnResponse(renamedTeamFixture(), requested).teams[0]?.teamId).toBe('1'));
  it('uses the ESPN name field when location and nickname are absent', () => {
    const fixture = espnFixture();
    const team = fixture.teams[0]!;
    const fixtureWithName = {
      ...fixture,
      teams: [
        {
          id: team.id,
          name: 'Pitts Out For the Boys',
          abbreviation: team.abbreviation,
          record: team.record,
        },
        fixture.teams[1],
      ],
    };
    expect(normalizeEspnResponse(fixtureWithName, requested).teams[0]?.displayName).toBe(
      'Pitts Out For the Boys',
    );
  });
  it('marks incomplete results non-final', () =>
    expect(normalizeEspnResponse(incompleteFixture(), requested).status.isFinal).toBe(false));
  it('rejects duplicate teams', () =>
    expect(() => normalizeEspnResponse(duplicateTeamFixture(), requested)).toThrow(/Duplicate/));
  it('retries rate limits and logs safe metadata', async () => {
    const logs: Record<string, unknown>[] = [];
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('{}', { status: 429, headers: { 'content-type': 'application/json' } }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(espnFixture()), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    await expect(
      fetchEspnLeague(
        { ...requested, timeoutMs: 100, maxAttempts: 2 },
        { fetcher, sleep: async () => {}, logger: (data) => logs.push(data) },
      ),
    ).resolves.toEqual(espnFixture());
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(logs[0]).not.toHaveProperty('body');
  });
  it('fails immediately when authentication is required', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response('{}', { status: 403, headers: { 'content-type': 'application/json' } }),
      );
    await expect(
      fetchEspnLeague({ ...requested, timeoutMs: 100, maxAttempts: 3 }, { fetcher }),
    ).rejects.toMatchObject<Partial<EspnError>>({ kind: 'authentication', attempts: 1 });
  });
});
