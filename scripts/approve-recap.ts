import { readFile, rename, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { loadEditions } from '../src/lib/editions/load.ts';
import { recapContentDigest, recapInputDigest } from '../src/lib/recaps/digest.ts';
import { recapEvidenceSchema, weeklyRecapSchema } from '../src/lib/recaps/schemas.ts';

export async function approveRecap(
  season: number,
  week: number,
  commissioner: string,
  now = new Date(),
): Promise<string> {
  const edition = (await loadEditions()).find(
    (item) => item.league.season === season && item.week.number === week,
  );
  if (!edition) throw new Error(`Edition not found for ${season} week ${week}`);
  const name = `week-${String(week).padStart(2, '0')}.json`;
  const evidencePath = `data/recap-inputs/${season}/${name}`;
  const recapPath = `data/recaps/${season}/${name}`;
  const evidence = recapEvidenceSchema.parse(JSON.parse(await readFile(evidencePath, 'utf8')));
  const recap = weeklyRecapSchema.parse(JSON.parse(await readFile(recapPath, 'utf8')));
  if (recap.editionId !== edition.editionId || evidence.editionId !== edition.editionId)
    throw new Error('Recap approval edition mismatch');
  if (recap.warnings.length) throw new Error('Resolve recap warnings before approval');
  const expectedInput = recapInputDigest(
    edition,
    evidence,
    recap.generation.promptVersion,
    recap.generation.configuredModel,
  );
  if (expectedInput !== recap.generation.inputDigest)
    throw new Error('Draft inputs changed; regenerate');
  const draft = { ...recap, approval: null };
  const approved = weeklyRecapSchema.parse({
    ...draft,
    approval: {
      status: 'approved',
      commissioner,
      approvedAt: now.toISOString(),
      contentDigest: recapContentDigest(edition, evidence, draft),
    },
  });
  const temporary = `${recapPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify(approved, null, 2)}\n`, { flag: 'w' });
  await rename(temporary, recapPath);
  return recapPath;
}

const args = process.argv.slice(2);
const value = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

async function main() {
  const season = Number(value('--season'));
  const week = Number(value('--week'));
  const commissioner = value('--commissioner');
  if (!Number.isInteger(season) || !Number.isInteger(week) || !commissioner)
    throw new Error('Provide integer --season/--week and --commissioner');
  console.log(`Approved ${await approveRecap(season, week, commissioner)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
