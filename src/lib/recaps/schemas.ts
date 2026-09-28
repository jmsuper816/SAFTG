import { z } from 'zod';
import { assertOfficialPublisher } from './publishers.ts';

const isoDate = z.iso.datetime({ offset: true });
const id = z.string().trim().min(1).max(120);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const unique = (values: string[]) => new Set(values).size === values.length;

const lineupEvidenceSchema = z.object({
  evidenceId: id,
  teamId: id,
  playerId: id,
  playerName: z.string().trim().min(1).max(100),
  lineupStatus: z.enum(['started', 'bench']),
  fantasyPoints: z.number().finite(),
  observedStatement: z.string().trim().min(1).max(300),
  factIds: z.array(id).min(1).refine(unique, 'Duplicate fact ID'),
});

const newsSourceSchema = z.object({
  sourceId: id,
  publisherType: z.enum(['nfl', 'team']),
  publisher: z.string().trim().min(1).max(100),
  url: z.url(),
  title: z.string().trim().min(1).max(200),
  publishedAt: isoDate,
  updatedAt: isoDate.nullable(),
  accessedAt: isoDate,
  subjects: z.array(id).min(1).refine(unique, 'Duplicate subject'),
  summary: z.string().trim().min(1).max(500),
});

export const recapEvidenceSchema = z
  .object({
    schemaVersion: z.literal(1),
    editionId: id,
    cutoff: z.object({ previous: isoDate, current: isoDate }),
    leagueFactIds: z.array(id).refine(unique, 'Duplicate league fact ID'),
    lineupEvidence: z.array(lineupEvidenceSchema),
    newsSources: z.array(newsSourceSchema),
    commissionerNoteDigests: z.array(sha256).refine(unique, 'Duplicate note digest'),
  })
  .superRefine((manifest, context) => {
    const previous = Date.parse(manifest.cutoff.previous);
    const current = Date.parse(manifest.cutoff.current);
    if (!(previous < current))
      context.addIssue({
        code: 'custom',
        path: ['cutoff'],
        message: 'Previous cutoff must precede current cutoff',
      });
    const evidenceIds = manifest.lineupEvidence.map(({ evidenceId }) => evidenceId);
    if (!unique(evidenceIds))
      context.addIssue({
        code: 'custom',
        path: ['lineupEvidence'],
        message: 'Duplicate evidence ID',
      });
    const sourceIds = manifest.newsSources.map(({ sourceId }) => sourceId);
    if (!unique(sourceIds))
      context.addIssue({ code: 'custom', path: ['newsSources'], message: 'Duplicate source ID' });
    manifest.newsSources.forEach((source, index) => {
      try {
        assertOfficialPublisher(source.publisherType, source.publisher, source.url);
      } catch (error) {
        context.addIssue({
          code: 'custom',
          path: ['newsSources', index, 'url'],
          message: error instanceof Error ? error.message : String(error),
        });
      }
      const eligibleAt = Date.parse(source.updatedAt ?? source.publishedAt);
      if (!(eligibleAt > previous && eligibleAt <= current))
        context.addIssue({
          code: 'custom',
          path: ['newsSources', index],
          message: 'Source is outside (previous,current] cutoff window',
        });
    });
  });

export const generatedRecapContentSchema = z.object({
  paragraphs: z.array(z.string().trim().min(1).max(1000)).min(1).max(6),
  evidenceRefs: z.array(
    z.object({
      paragraphIndex: z.number().int().nonnegative(),
      factIds: z.array(id).refine(unique, 'Duplicate fact ID'),
      sourceIds: z.array(id).refine(unique, 'Duplicate source ID'),
    }),
  ),
  warnings: z.array(z.string().trim().min(1).max(500)).refine(unique, 'Duplicate warning'),
});

export const weeklyRecapSchema = generatedRecapContentSchema
  .extend({
    schemaVersion: z.literal(1),
    editionId: id,
    generation: z.object({
      generatedAt: isoDate,
      provider: z.literal('openai'),
      configuredModel: id,
      responseModel: id,
      requestId: id,
      promptVersion: z.number().int().positive(),
      inputDigest: sha256,
    }),
    approval: z
      .object({
        status: z.literal('approved'),
        commissioner: z.string().trim().min(1).max(80),
        approvedAt: isoDate,
        contentDigest: sha256,
      })
      .nullable(),
  })
  .superRefine((recap, context) => {
    recap.evidenceRefs.forEach((reference, index) => {
      if (reference.paragraphIndex >= recap.paragraphs.length)
        context.addIssue({
          code: 'custom',
          path: ['evidenceRefs', index, 'paragraphIndex'],
          message: 'Paragraph reference is out of range',
        });
    });
  });
