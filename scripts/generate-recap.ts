import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadEditions } from '../src/lib/editions/load.ts';
import { loadRecapConfig } from '../src/lib/recaps/config.ts';
import {
  OpenAIRecapGenerator,
  createRecapDraft,
  type RecapGenerator,
} from '../src/lib/recaps/generator.ts';
import { loadCommissionerNotes } from '../src/lib/recaps/notes.ts';
import { recapEvidenceSchema, weeklyRecapSchema } from '../src/lib/recaps/schemas.ts';

export interface DraftOptions {
  season: number;
  week: number;
  generator?: RecapGenerator;
  model?: string;
  apiKey?: string;
  now?: Date;
}

const weekName = (week: number) => `week-${String(week).padStart(2, '0')}.json`;

export async function generateRecap(options: DraftOptions): Promise<string> {
  const edition = (await loadEditions()).find(
    (item) => item.league.season === options.season && item.week.number === options.week,
  );
  if (!edition) throw new Error(`Edition not found for ${options.season} week ${options.week}`);
  const evidencePath = `data/recap-inputs/${options.season}/${weekName(options.week)}`;
  const outputPath = `data/recaps/${options.season}/${weekName(options.week)}`;
  const evidence = recapEvidenceSchema.parse(JSON.parse(await readFile(evidencePath, 'utf8')));
  if (evidence.editionId !== edition.editionId) throw new Error('Recap evidence edition mismatch');
  const notes = await loadCommissionerNotes(
    `data/recap-notes/${options.season}/${weekName(options.week).replace(/\.json$/, '.txt')}`,
  );
  const actualDigests = notes ? [notes.digest] : [];
  if (actualDigests.join('\0') !== evidence.commissionerNoteDigests.join('\0'))
    throw new Error('Commissioner note digest mismatch');
  const config =
    options.generator && options.model
      ? {
          OPENAI_API_KEY: options.apiKey ?? 'test',
          RECAP_MODEL: options.model,
          RECAP_TIMEOUT_MS: 90_000,
        }
      : loadRecapConfig();
  const generator =
    options.generator ??
    new OpenAIRecapGenerator(config.OPENAI_API_KEY, config.RECAP_MODEL, config.RECAP_TIMEOUT_MS);
  const recap = weeklyRecapSchema.parse(
    await createRecapDraft(
      edition,
      evidence,
      notes?.text ?? null,
      config.RECAP_MODEL,
      generator,
      options.now,
    ),
  );
  await mkdir(dirname(outputPath), { recursive: true });
  const temporary = `${outputPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify(recap, null, 2)}\n`, { flag: 'w' });
  await rename(temporary, outputPath);
  return outputPath;
}

const args = process.argv.slice(2);
const value = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

async function main() {
  const season = Number(value('--season'));
  const week = Number(value('--week'));
  if (!Number.isInteger(season) || !Number.isInteger(week))
    throw new Error('Provide integer --season and --week');
  console.log(`Generated ${await generateRecap({ season, week })}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
