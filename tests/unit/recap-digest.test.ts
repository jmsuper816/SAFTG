import { describe, expect, it } from 'vitest';
import { canonicalJson, recapContentDigest, recapInputDigest } from '../../src/lib/recaps/digest';
import { loadEditions } from '../../src/lib/editions/load';
import { recapEvidenceSchema, weeklyRecapSchema } from '../../src/lib/recaps/schemas';
import weekOneEvidence from '../../data/recap-inputs/2026/week-01.json';
import weekOneRecap from '../../data/recaps/2026/week-01.json';

describe('recap digests', () => {
  it('sorts object keys while retaining authored array order', () => {
    expect(canonicalJson({ b: 2, a: [2, 1] })).toBe('{"a":[2,1],"b":2}');
  });

  it('changes for relevant inputs and prose but excludes generation audit fields', async () => {
    const edition = (await loadEditions())[0]!;
    const evidence = recapEvidenceSchema.parse(weekOneEvidence);
    const recap = weeklyRecapSchema.parse(weekOneRecap);
    const first = recapInputDigest(edition, evidence, 1, 'gpt-5.5');
    expect(recapInputDigest(edition, evidence, 1, 'gpt-5.5')).toBe(first);
    expect(recapInputDigest(edition, { ...evidence, leagueFactIds: [] }, 1, 'gpt-5.5')).not.toBe(
      first,
    );
    const content = recapContentDigest(edition, evidence, recap);
    expect(
      recapContentDigest(edition, evidence, {
        ...recap,
        generation: { ...recap.generation, requestId: 'different' },
      }),
    ).toBe(content);
    expect(recapContentDigest(edition, evidence, { ...recap, paragraphs: ['Changed'] })).not.toBe(
      content,
    );
  });
});
