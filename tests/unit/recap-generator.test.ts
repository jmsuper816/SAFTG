import { describe, expect, it } from 'vitest';
import { buildFactPacket, createRecapDraft } from '../../src/lib/recaps/generator';
import { loadEditions } from '../../src/lib/editions/load';
import evidence from '../../data/recap-inputs/2026/week-01.json';
import { recapEvidenceSchema } from '../../src/lib/recaps/schemas';

const manifest = recapEvidenceSchema.parse(evidence);

describe('recap generation boundary', () => {
  it('sends a closed fact packet and accepts injected generation', async () => {
    const edition = (await loadEditions())[0]!;
    const packet = buildFactPacket(edition, manifest, null);
    expect(packet).toContain('Use only supplied IDs');
    expect(packet).not.toContain('OPENAI_API_KEY');
    const draft = await createRecapDraft(edition, manifest, null, 'fake', {
      generate: async () => ({
        content: { paragraphs: ['Draft'], evidenceRefs: [], warnings: [] },
        responseModel: 'fake',
        requestId: 'fake-1',
      }),
    });
    expect(draft.approval).toBeNull();
  });

  it('rejects unknown generated evidence references', async () => {
    const edition = (await loadEditions())[0]!;
    await expect(
      createRecapDraft(edition, manifest, null, 'fake', {
        generate: async () => ({
          content: {
            paragraphs: ['Draft'],
            evidenceRefs: [{ paragraphIndex: 0, factIds: ['invented'], sourceIds: [] }],
            warnings: [],
          },
          responseModel: 'fake',
          requestId: 'fake-2',
        }),
      }),
    ).rejects.toThrow(/Unknown generated fact/);
  });
});
