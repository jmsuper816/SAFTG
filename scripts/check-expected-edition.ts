import { latestEdition, loadEditions } from '../src/lib/editions/load.ts';

const latest = latestEdition(await loadEditions());
if (!latest) throw new Error('No complete reviewed edition is available');
const age = Date.now() - new Date(latest.publishedAt).getTime();
if (age < 0 || age > 8 * 24 * 60 * 60 * 1000)
  throw new Error(`Latest reviewed edition is stale: ${latest.editionId}`);
console.log(`Current reviewed edition: ${latest.editionId}`);
