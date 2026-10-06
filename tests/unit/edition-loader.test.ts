import { describe, expect, it } from 'vitest';
import { loadEditions, latestEdition } from '../../src/lib/editions/load';

describe('edition loader', () => {
  it('loads committed editions chronologically', async () => {
    const editions = await loadEditions();
    expect(editions.map((edition) => edition.week.number)).toEqual([1, 2, 3, 4]);
    expect(latestEdition(editions)?.week.number).toBe(4);
  });
  it('returns an empty list for an absent directory', async () =>
    expect(loadEditions('missing-editions')).resolves.toEqual([]));
});
