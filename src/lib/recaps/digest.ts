import { createHash } from 'node:crypto';
import type { WeeklyEdition } from '../domain/types.ts';
import type { RecapEvidenceManifest, WeeklyRecap } from './types.ts';

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  return value;
};

export const canonicalJson = (value: unknown): string => JSON.stringify(canonicalize(value));
export const sha256 = (value: unknown): string =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');

export const editionFactProjection = (edition: WeeklyEdition) => ({
  editionId: edition.editionId,
  publishedAt: edition.publishedAt,
  entries: edition.entries.map(
    ({ teamId, displayName, rank, movement, record, weeklyScore, winningStreak, badgeIds }) => ({
      teamId,
      displayName,
      rank,
      movement,
      record,
      weeklyScore,
      winningStreak,
      badgeIds,
    }),
  ),
  badges: edition.badges,
});

export const recapInputDigest = (
  edition: WeeklyEdition,
  evidence: RecapEvidenceManifest,
  promptVersion: number,
  configuredModel: string,
): string =>
  sha256({
    version: 1,
    edition: editionFactProjection(edition),
    evidence,
    promptVersion,
    configuredModel,
  });

export const recapContentDigest = (
  edition: WeeklyEdition,
  evidence: RecapEvidenceManifest,
  recap: WeeklyRecap,
): string =>
  sha256({
    version: 1,
    edition: editionFactProjection(edition),
    evidence,
    promptVersion: recap.generation.promptVersion,
    configuredModel: recap.generation.configuredModel,
    paragraphs: recap.paragraphs,
    evidenceRefs: recap.evidenceRefs,
    warnings: recap.warnings,
  });

export type RecapState = 'draft' | 'approved' | 'invalidated';
export const recapState = (
  edition: WeeklyEdition,
  evidence: RecapEvidenceManifest,
  recap: WeeklyRecap,
): RecapState => {
  if (!recap.approval) return 'draft';
  return recap.approval.contentDigest === recapContentDigest(edition, evidence, recap)
    ? 'approved'
    : 'invalidated';
};
