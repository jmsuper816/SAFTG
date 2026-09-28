import OpenAI from 'openai';
import type { WeeklyEdition } from '../domain/types.ts';
import { recapInputDigest } from './digest.ts';
import { generatedRecapContentSchema } from './schemas.ts';
import type { GeneratedRecapContent, RecapEvidenceManifest, WeeklyRecap } from './types.ts';

export const RECAP_PROMPT_VERSION = 1;

export interface RecapGenerationResult {
  content: GeneratedRecapContent;
  responseModel: string;
  requestId: string;
}

export interface RecapGenerator {
  generate(input: string): Promise<RecapGenerationResult>;
}

export const buildLeagueFacts = (edition: WeeklyEdition) =>
  edition.entries.flatMap((entry) => [
    {
      factId: `team-${entry.teamId}-rank`,
      statement: `${entry.displayName} is ranked ${entry.rank} with movement ${entry.movement ?? 'new'}.`,
    },
    {
      factId: `team-${entry.teamId}-score`,
      statement: `${entry.displayName} scored ${entry.weeklyScore.toFixed(2)} points.`,
    },
    ...entry.badgeIds.map((badgeId) => ({
      factId: `team-${entry.teamId}-badge-${badgeId}`,
      statement: `${entry.displayName} earned the ${badgeId} badge.`,
    })),
  ]);

export function buildFactPacket(
  edition: WeeklyEdition,
  evidence: RecapEvidenceManifest,
  commissionerNotes: string | null,
): string {
  const allowedLeagueFacts = new Set(evidence.leagueFactIds);
  const leagueFacts = buildLeagueFacts(edition).filter(({ factId }) =>
    allowedLeagueFacts.has(factId),
  );
  return JSON.stringify({
    editionId: edition.editionId,
    leagueFacts,
    lineupEvidence: evidence.lineupEvidence,
    newsSources: evidence.newsSources,
    commissionerNotes,
    rules: {
      paragraphCount: '1-6',
      sources:
        'Use only supplied IDs and facts. Never invent a name, number, URL, event, or cause.',
      lineup:
        'Started points counted; bench points are missed opportunities and must be labeled that way.',
      tone: 'Lively, concise, affectionate league banter. Do not produce hateful, threatening, sexual, demeaning, or unsupported personal claims.',
      toneExample:
        'Use the supplied sample only as a style guide: energetic weekly-story framing, playful badge commentary, affectionate league callbacks, and a forward-looking closer. Never copy its facts or wording.',
    },
  });
}

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['paragraphs', 'evidenceRefs', 'warnings'],
  properties: {
    paragraphs: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string' } },
    evidenceRefs: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['paragraphIndex', 'factIds', 'sourceIds'],
        properties: {
          paragraphIndex: { type: 'integer', minimum: 0 },
          factIds: { type: 'array', items: { type: 'string' } },
          sourceIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
} as const;

export class OpenAIRecapGenerator implements RecapGenerator {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
    timeoutMs = 90_000,
  ) {
    this.client = new OpenAI({ apiKey, timeout: timeoutMs, maxRetries: 2 });
  }

  async generate(input: string): Promise<RecapGenerationResult> {
    const response = await this.client.responses.create(
      {
        model: this.model,
        store: false,
        instructions:
          'Write a fantasy-football weekly recap using only the supplied evidence. Return evidence IDs for factual paragraphs and warnings for anything requiring commissioner attention.',
        input,
        text: {
          format: {
            type: 'json_schema',
            name: 'weekly_recap',
            strict: true,
            schema: outputSchema,
          },
        },
      },
      { signal: AbortSignal.timeout(180_000) },
    );
    if (response.status !== 'completed' || !response.output_text)
      throw new Error(`Recap generation incomplete: ${response.status}`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(response.output_text);
    } catch {
      throw new Error('Recap generator returned invalid JSON');
    }
    return {
      content: generatedRecapContentSchema.parse(parsed),
      responseModel: response.model,
      requestId: response.id,
    };
  }
}

export function validateGeneratedReferences(
  content: GeneratedRecapContent,
  edition: WeeklyEdition,
  evidence: RecapEvidenceManifest,
): void {
  const facts = new Set([
    ...buildLeagueFacts(edition).map(({ factId }) => factId),
    ...evidence.lineupEvidence.flatMap((item) => [item.evidenceId, ...item.factIds]),
  ]);
  const sources = new Set(evidence.newsSources.map(({ sourceId }) => sourceId));
  for (const reference of content.evidenceRefs) {
    for (const factId of reference.factIds)
      if (!facts.has(factId)) throw new Error(`Unknown generated fact reference: ${factId}`);
    for (const sourceId of reference.sourceIds)
      if (!sources.has(sourceId))
        throw new Error(`Unknown generated source reference: ${sourceId}`);
  }
}

export async function createRecapDraft(
  edition: WeeklyEdition,
  evidence: RecapEvidenceManifest,
  commissionerNotes: string | null,
  configuredModel: string,
  generator: RecapGenerator,
  now = new Date(),
): Promise<WeeklyRecap> {
  const result = await generator.generate(buildFactPacket(edition, evidence, commissionerNotes));
  validateGeneratedReferences(result.content, edition, evidence);
  return {
    schemaVersion: 1,
    editionId: edition.editionId,
    ...result.content,
    generation: {
      generatedAt: now.toISOString(),
      provider: 'openai',
      configuredModel,
      responseModel: result.responseModel,
      requestId: result.requestId,
      promptVersion: RECAP_PROMPT_VERSION,
      inputDigest: recapInputDigest(edition, evidence, RECAP_PROMPT_VERSION, configuredModel),
    },
    approval: null,
  };
}
