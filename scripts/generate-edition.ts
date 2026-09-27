import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { loadConfig } from '../src/lib/config.ts';
import { editionSchema } from '../src/lib/domain/schemas.ts';
import type { WeeklyEdition } from '../src/lib/domain/types.ts';
import { loadEditions, latestEdition } from '../src/lib/editions/load.ts';
import { loadCommissionerRanking, loadDraftRanking } from '../src/lib/editions/load-ranking.ts';
import { normalizeEdition } from '../src/lib/editions/normalize.ts';
import { fetchEspnLeague } from '../src/lib/espn/client.ts';
import { normalizeEspnResponse } from '../src/lib/espn/normalize.ts';

const args = process.argv.slice(2);
const value = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const season = Number(value('--season') ?? process.env.ESPN_SEASON);
const week = Number(value('--week'));
const rankingPath = `data/rankings/${season}/week-${String(week).padStart(2, '0')}.json`;
const outputPath = `data/editions/${season}/week-${String(week).padStart(2, '0')}.json`;

async function main() {
  if (!Number.isInteger(season) || !Number.isInteger(week))
    throw new Error('Provide integer --season and --week');
  const ranking = await loadCommissionerRanking(rankingPath);
  if (args.includes('--validate-ranking')) {
    console.log(`Valid ranking: ${rankingPath}`);
    return;
  }
  if (args.includes('--verify')) {
    editionSchema.parse(JSON.parse(await readFile(outputPath, 'utf8')));
    console.log(`Valid edition: ${outputPath}`);
    return;
  }
  const config = loadConfig();
  const fixture = value('--fixture');
  const raw = fixture
    ? JSON.parse(await readFile(join('tests/fixtures/espn', `${fixture}.json`), 'utf8'))
    : await fetchEspnLeague({
        leagueId: config.ESPN_LEAGUE_ID,
        season,
        week,
        timeoutMs: config.ESPN_TIMEOUT_MS,
        maxAttempts: config.ESPN_MAX_ATTEMPTS,
      });
  const snapshot = normalizeEspnResponse(raw, {
    leagueId: config.ESPN_LEAGUE_ID,
    season,
    week,
    timezone: config.LEAGUE_TIMEZONE,
  });
  const previous = latestEdition(
    (await loadEditions()).filter(
      (item) => item.league.season === season && item.week.number < week,
    ),
  );
  let draftRanking = null;
  try {
    draftRanking = await loadDraftRanking(`data/rankings/${season}/draft-day.json`);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
  }
  let publishedAt = value('--published-at');
  try {
    publishedAt ??= (JSON.parse(await readFile(outputPath, 'utf8')) as WeeklyEdition).publishedAt;
  } catch {
    /* new edition */
  }
  publishedAt ??= new Date().toISOString();
  const edition = normalizeEdition(ranking, snapshot, {
    timezone: config.LEAGUE_TIMEZONE,
    submissionPath: rankingPath,
    publishedAt,
    previous,
    draftRanking,
  });
  await mkdir(dirname(outputPath), { recursive: true });
  const temporary = `${outputPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify(edition, null, 2)}\n`, { flag: 'w' });
  await rename(temporary, outputPath);
  console.log(`Generated ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
