import { z } from 'zod';

const finite = z.number().finite();
const record = z
  .object({
    overall: z
      .object({
        wins: z.number(),
        losses: z.number(),
        ties: z.number(),
        pointsFor: finite,
        pointsAgainst: finite,
      })
      .passthrough(),
  })
  .passthrough();

export const espnResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    seasonId: z.number().int(),
    settings: z.object({ name: z.string().trim().min(1).max(100) }).passthrough(),
    status: z.object({ currentMatchupPeriod: z.number().int().min(1).max(25) }).passthrough(),
    teams: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]),
            name: z.string().optional(),
            location: z.string().optional(),
            nickname: z.string().optional(),
            abbreviation: z.string().optional(),
            logo: z.string().url().optional(),
            record,
          })
          .passthrough(),
      )
      .min(2)
      .max(20),
    schedule: z.array(
      z
        .object({
          id: z.union([z.string(), z.number()]),
          matchupPeriodId: z.number().int().min(1).max(25),
          winner: z.enum(['HOME', 'AWAY', 'TIE', 'UNDECIDED', 'BYE']).optional(),
          home: z
            .object({ teamId: z.union([z.string(), z.number()]), totalPoints: finite })
            .passthrough(),
          away: z
            .object({ teamId: z.union([z.string(), z.number()]), totalPoints: finite })
            .passthrough()
            .optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();
