import { pathToFileURL } from 'node:url';
import { loadEditions } from '../src/lib/editions/load.ts';
import { loadPublishedRecaps } from '../src/lib/recaps/load.ts';

const args = process.argv.slice(2);
const value = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

export async function verifyRecaps(season?: number, week?: number): Promise<number> {
  const allEditions = await loadEditions();
  const editions = allEditions.filter(
    (edition) =>
      (season === undefined || edition.league.season === season) &&
      (week === undefined || edition.week.number === week),
  );
  if (!editions.length) throw new Error('No matching editions to verify');
  const recaps = await loadPublishedRecaps(allEditions);
  return editions.filter((edition) => recaps.has(edition.editionId)).length;
}

async function main() {
  const seasonValue = value('--season');
  const weekValue = value('--week');
  const season = seasonValue === undefined ? undefined : Number(seasonValue);
  const week = weekValue === undefined ? undefined : Number(weekValue);
  if (
    (season !== undefined && !Number.isInteger(season)) ||
    (week !== undefined && !Number.isInteger(week))
  )
    throw new Error('Provide integer --season and --week');
  console.log(`Verified ${await verifyRecaps(season, week)} approved recap(s)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
