import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { WeeklyEdition } from '../domain/types.ts';
import { recapInputDigest, recapState } from './digest.ts';
import { recapEvidenceSchema, weeklyRecapSchema } from './schemas.ts';
import type { PublishedRecap, RecapEvidenceManifest, WeeklyRecap } from './types.ts';

export interface RecapRoots {
  evidence?: string;
  recaps?: string;
}

async function loadJsonFiles(root: string): Promise<Array<{ path: string; value: unknown }>> {
  const values: Array<{ path: string; value: unknown }> = [];
  for (const season of (await readdir(root).catch(() => [] as string[])).sort()) {
    for (const file of (await readdir(join(root, season)).catch(() => [] as string[]))
      .filter((name) => /^week-\d{2}\.json$/.test(name))
      .sort()) {
      const path = join(root, season, file);
      values.push({ path, value: JSON.parse(await readFile(path, 'utf8')) });
    }
  }
  return values;
}

export async function loadPublishedRecaps(
  editions: WeeklyEdition[],
  roots: RecapRoots = {},
): Promise<Map<string, PublishedRecap>> {
  const evidenceFiles = await loadJsonFiles(roots.evidence ?? 'data/recap-inputs');
  const recapFiles = await loadJsonFiles(roots.recaps ?? 'data/recaps');
  const evidence = evidenceFiles.map(({ value }) => recapEvidenceSchema.parse(value));
  const recaps = recapFiles.map(({ value }) => weeklyRecapSchema.parse(value));
  const editionById = new Map(editions.map((edition) => [edition.editionId, edition]));
  const uniqueById = <T extends { editionId: string }>(values: T[], label: string) => {
    const map = new Map<string, T>();
    for (const value of values) {
      if (map.has(value.editionId)) throw new Error(`Duplicate ${label} for ${value.editionId}`);
      if (!editionById.has(value.editionId))
        throw new Error(`Orphaned ${label}: ${value.editionId}`);
      map.set(value.editionId, value);
    }
    return map;
  };
  const evidenceById = uniqueById<RecapEvidenceManifest>(evidence, 'recap evidence');
  const recapById = uniqueById<WeeklyRecap>(recaps, 'recap');
  const published = new Map<string, PublishedRecap>();
  for (const edition of editions) {
    const manifest = evidenceById.get(edition.editionId);
    const recap = recapById.get(edition.editionId);
    if (!manifest || !recap)
      throw new Error(`Missing recap inputs or artifact for ${edition.editionId}`);
    if (manifest.cutoff.current !== edition.publishedAt)
      throw new Error(`Recap cutoff does not match publication for ${edition.editionId}`);
    const teamIds = new Set(edition.entries.map(({ teamId }) => teamId));
    for (const item of manifest.lineupEvidence)
      if (!teamIds.has(item.teamId))
        throw new Error(`Unknown recap team ${item.teamId} in ${edition.editionId}`);
    const expectedInput = recapInputDigest(
      edition,
      manifest,
      recap.generation.promptVersion,
      recap.generation.configuredModel,
    );
    if (recap.generation.inputDigest !== expectedInput)
      throw new Error(`Stale recap generation inputs for ${edition.editionId}`);
    if (recap.warnings.length) throw new Error(`Blocking recap warning for ${edition.editionId}`);
    const state = recapState(edition, manifest, recap);
    if (state !== 'approved') throw new Error(`Recap ${edition.editionId} is ${state}`);
    published.set(edition.editionId, {
      editionId: edition.editionId,
      paragraphs: recap.paragraphs,
    });
  }
  return published;
}
