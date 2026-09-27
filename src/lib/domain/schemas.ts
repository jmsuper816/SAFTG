import { z } from 'zod';
import { badgeCatalog } from '../badges/catalog.ts';

const isoDate = z.iso.datetime({ offset: true });
const finite = z.number().finite();
const recordSchema = z.object({
  wins: z.int().nonnegative(),
  losses: z.int().nonnegative(),
  ties: z.int().nonnegative(),
  pointsFor: finite,
  pointsAgainst: finite,
});

export const rankingSubmissionSchema = z.object({
  teamId: z.string().trim().min(1).max(64),
  rank: z.int().min(1).max(20),
  explanation: z.string().trim().min(1).max(500),
});

export const commissionerRankingSchema = z
  .object({
    schemaVersion: z.literal(1),
    leagueId: z.string().trim().min(1).max(64),
    season: z.int().min(2020).max(2100),
    week: z.int().min(1).max(25),
    commissioner: z.string().trim().min(1).max(80),
    submittedAt: isoDate,
    rankings: z.array(rankingSubmissionSchema).min(2).max(20),
  })
  .superRefine(({ rankings }, context) => {
    const ids = new Set<string>();
    rankings.forEach((entry, index) => {
      if (ids.has(entry.teamId)) {
        context.addIssue({
          code: 'custom',
          path: ['rankings', index, 'teamId'],
          message: 'Duplicate teamId',
        });
      }
      ids.add(entry.teamId);
      if (index > 0 && entry.rank < rankings[index - 1]!.rank) {
        context.addIssue({
          code: 'custom',
          path: ['rankings', index, 'rank'],
          message: 'Ranks must be non-decreasing',
        });
      }
    });
    let index = 0;
    while (index < rankings.length) {
      const rank = rankings[index]!.rank;
      if (rank !== index + 1) {
        context.addIssue({
          code: 'custom',
          path: ['rankings', index, 'rank'],
          message: 'Use competition ranking gaps',
        });
        break;
      }
      while (index + 1 < rankings.length && rankings[index + 1]!.rank === rank) index += 1;
      index += 1;
    }
  });

export const draftRankingSchema = z
  .object({
    schemaVersion: z.literal(1),
    leagueId: z.string().trim().min(1).max(64),
    season: z.int().min(2020).max(2100),
    label: z.string().trim().min(1).max(80),
    rankings: z
      .array(
        z.object({
          teamId: z.string().trim().min(1).max(64),
          displayName: z.string().trim().min(1).max(60),
          rank: z.int().min(1).max(20),
        }),
      )
      .min(2)
      .max(20),
  })
  .superRefine(({ rankings }, context) => {
    if (new Set(rankings.map(({ teamId }) => teamId)).size !== rankings.length)
      context.addIssue({ code: 'custom', path: ['rankings'], message: 'Duplicate teamId' });
    if (new Set(rankings.map(({ rank }) => rank)).size !== rankings.length)
      context.addIssue({ code: 'custom', path: ['rankings'], message: 'Duplicate rank' });
    rankings.forEach(({ rank }, index) => {
      if (rank !== index + 1)
        context.addIssue({
          code: 'custom',
          path: ['rankings', index, 'rank'],
          message: 'Draft ranks must be sequential',
        });
    });
  });

const badgeId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const knownBadgeIds = new Set(badgeCatalog.map((badge) => badge.badgeId));
export const editionSchema = z
  .object({
    schemaVersion: z.literal(1),
    editionId: z.string().regex(/^.+-\d{4}-week-\d{2}$/),
    league: z.object({
      leagueId: z.string().min(1),
      name: z.string().trim().min(1).max(100),
      season: z.int().min(2020).max(2100),
      timezone: z.string().min(1),
    }),
    week: z.object({
      number: z.int().min(1).max(25),
      startsAt: isoDate,
      endsAt: isoDate,
      sourceStatus: z.literal('final'),
    }),
    publishedAt: isoDate,
    rankingSource: z.object({
      type: z.literal('commissioner'),
      commissioner: z.string().trim().min(1).max(80),
      submissionPath: z.string().min(1),
    }),
    entries: z
      .array(
        z.object({
          teamId: z.string().min(1),
          displayName: z.string().trim().min(1).max(60),
          rank: z.int().min(1).max(20),
          previousRank: z.int().min(1).max(20).nullable(),
          movement: z.int().min(-19).max(19).nullable(),
          record: recordSchema,
          weeklyScore: finite,
          winningStreak: z.int().nonnegative().max(25),
          explanation: z.string().trim().min(1).max(500),
          badgeIds: z.array(badgeId).refine((value) => new Set(value).size === value.length),
        }),
      )
      .min(2)
      .max(20),
    badges: z.array(
      z.object({
        badgeId,
        teamId: z.string().min(1),
        reason: z.string().trim().min(1).max(300),
        metric: finite.nullable(),
      }),
    ),
    previousEditionId: z.string().nullable(),
  })
  .superRefine((edition, context) => {
    const ids = edition.entries.map((entry) => entry.teamId);
    if (new Set(ids).size !== ids.length)
      context.addIssue({ code: 'custom', path: ['entries'], message: 'Duplicate team entry' });
    const awards = new Set<string>();
    edition.badges.forEach((award, index) => {
      if (!knownBadgeIds.has(award.badgeId))
        context.addIssue({
          code: 'custom',
          path: ['badges', index, 'badgeId'],
          message: 'Unknown badge',
        });
      if (!ids.includes(award.teamId))
        context.addIssue({
          code: 'custom',
          path: ['badges', index, 'teamId'],
          message: 'Unknown team',
        });
      const key = `${award.badgeId}:${award.teamId}`;
      if (awards.has(key))
        context.addIssue({
          code: 'custom',
          path: ['badges', index],
          message: 'Duplicate badge award',
        });
      awards.add(key);
    });
    edition.entries.forEach((entry, entryIndex) => {
      entry.badgeIds.forEach((entryBadgeId, badgeIndex) => {
        if (!knownBadgeIds.has(entryBadgeId))
          context.addIssue({
            code: 'custom',
            path: ['entries', entryIndex, 'badgeIds', badgeIndex],
            message: 'Unknown badge',
          });
      });
      const awarded = edition.badges
        .filter((award) => award.teamId === entry.teamId)
        .map((award) => award.badgeId)
        .sort();
      const referenced = [...entry.badgeIds].sort();
      if (awarded.join('\0') !== referenced.join('\0'))
        context.addIssue({
          code: 'custom',
          path: ['entries', entryIndex, 'badgeIds'],
          message: 'Badge references disagree with awards',
        });
    });
  });

export type CommissionerRankingInput = z.infer<typeof commissionerRankingSchema>;
export type EditionInput = z.infer<typeof editionSchema>;
