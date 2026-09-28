import { z } from 'zod';

const recapConfigSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1),
  RECAP_MODEL: z.string().trim().min(1).default('gpt-5.5'),
  RECAP_TIMEOUT_MS: z.coerce.number().int().positive().max(180_000).default(90_000),
});

export type RecapConfig = z.infer<typeof recapConfigSchema>;

export const loadRecapConfig = (env: NodeJS.ProcessEnv = process.env): RecapConfig =>
  recapConfigSchema.parse(env);
