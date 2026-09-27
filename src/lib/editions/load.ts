import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { editionSchema } from '../domain/schemas.ts';
import type { WeeklyEdition } from '../domain/types.ts';

export async function loadEditions(root = 'data/editions'): Promise<WeeklyEdition[]> {
  const editions: WeeklyEdition[] = [];
  const seasons = await readdir(root).catch(() => [] as string[]);
  for (const season of seasons.sort()) {
    const files = await readdir(join(root, season)).catch(() => [] as string[]);
    for (const file of files.filter((name) => /^week-\d{2}\.json$/.test(name)).sort()) {
      editions.push(
        editionSchema.parse(
          JSON.parse(await readFile(join(root, season, file), 'utf8')),
        ) as WeeklyEdition,
      );
    }
  }
  const ids = editions.map((edition) => edition.editionId);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate edition ID');
  return editions.sort(
    (a, b) => a.league.season - b.league.season || a.week.number - b.week.number,
  );
}

export const latestEdition = (editions: WeeklyEdition[]) => editions.at(-1) ?? null;
