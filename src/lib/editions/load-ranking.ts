import { readFile } from 'node:fs/promises';
import { commissionerRankingSchema, draftRankingSchema } from '../domain/schemas.ts';
import type { CommissionerRanking, DraftRanking } from '../domain/types.ts';

export async function loadCommissionerRanking(path: string): Promise<CommissionerRanking> {
  return commissionerRankingSchema.parse(
    JSON.parse(await readFile(path, 'utf8')),
  ) as CommissionerRanking;
}

export async function loadDraftRanking(path: string): Promise<DraftRanking> {
  return draftRankingSchema.parse(JSON.parse(await readFile(path, 'utf8'))) as DraftRanking;
}

export function assertCompleteRanking(ranking: CommissionerRanking, teamIds: string[]): void {
  const expected = new Set(teamIds);
  const actual = new Set(ranking.rankings.map((entry) => entry.teamId));
  if (expected.size !== actual.size || [...expected].some((id) => !actual.has(id)))
    throw new Error('Commissioner ranking must contain every active team exactly once');
}
