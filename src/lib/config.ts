import { z } from 'zod';

const schema = z.object({
  ESPN_LEAGUE_ID: z.string().trim().min(1).max(64),
  ESPN_SEASON: z.coerce.number().int().min(2020).max(2100),
  LEAGUE_TIMEZONE: z.string().refine((value) => {
    try {
      Intl.DateTimeFormat('en', { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, 'Invalid IANA timezone'),
  SITE_ORIGIN: z.url().refine((value) => value.startsWith('https://'), 'HTTPS required'),
  SITE_BASE: z.string().regex(/^\/[A-Za-z0-9._/-]*$/),
  ESPN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  ESPN_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(5).default(3),
});

export type AppConfig = z.infer<typeof schema>;
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): AppConfig => schema.parse(env);
