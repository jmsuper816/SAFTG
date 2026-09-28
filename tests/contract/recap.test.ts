import { describe, expect, it } from 'vitest';
import { recapEvidenceSchema, weeklyRecapSchema } from '../../src/lib/recaps/schemas';

const evidence = {
  schemaVersion: 1,
  editionId: 'edition-1',
  cutoff: { previous: '2026-09-01T00:00:00.000Z', current: '2026-09-08T00:00:00.000Z' },
  leagueFactIds: ['team-1-score'],
  lineupEvidence: [],
  newsSources: [],
  commissionerNoteDigests: [],
} as const;

describe('recap contracts', () => {
  it('accepts a minimal version-one evidence manifest', () => {
    expect(recapEvidenceSchema.parse(evidence).editionId).toBe('edition-1');
  });

  it('rejects invalid cutoffs and unsupported publishers', () => {
    expect(() =>
      recapEvidenceSchema.parse({
        ...evidence,
        cutoff: { previous: evidence.cutoff.current, current: evidence.cutoff.previous },
      }),
    ).toThrow(/cutoff/i);
    expect(() =>
      recapEvidenceSchema.parse({
        ...evidence,
        newsSources: [
          {
            sourceId: 'bad',
            publisherType: 'nfl',
            publisher: 'Blog',
            url: 'https://example.com/a',
            title: 'Bad',
            publishedAt: '2026-09-02T00:00:00.000Z',
            updatedAt: null,
            accessedAt: '2026-09-03T00:00:00.000Z',
            subjects: ['x'],
            summary: 'Nope',
          },
        ],
      }),
    ).toThrow(/official|host/i);
  });

  it('enforces paragraph bounds, references, metadata, and nullable approval', () => {
    const recap = {
      schemaVersion: 1,
      editionId: 'edition-1',
      paragraphs: ['Hello'],
      evidenceRefs: [{ paragraphIndex: 0, factIds: ['team-1-score'], sourceIds: [] }],
      warnings: [],
      generation: {
        generatedAt: '2026-09-08T00:01:00.000Z',
        provider: 'openai',
        configuredModel: 'test',
        responseModel: 'test',
        requestId: 'r1',
        promptVersion: 1,
        inputDigest: 'a'.repeat(64),
      },
      approval: null,
    };
    expect(weeklyRecapSchema.parse(recap).approval).toBeNull();
    expect(() => weeklyRecapSchema.parse({ ...recap, paragraphs: [] })).toThrow();
    expect(() =>
      weeklyRecapSchema.parse({
        ...recap,
        evidenceRefs: [{ paragraphIndex: 1, factIds: [], sourceIds: [] }],
      }),
    ).toThrow(/range/i);
  });
});
