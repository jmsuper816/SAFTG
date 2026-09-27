import type { BadgeDefinition, WeeklyEdition } from '../domain/types.ts';
import { badgeCatalog, badgeById } from './catalog.ts';

export const EMPTY_BADGE_SUMMARY_MESSAGE = 'No badges were awarded this week.';

export interface BadgeSummaryRecipient {
  teamId: string;
  displayName: string;
  rank: number;
  reason: string;
}

export interface BadgeSummaryGroup {
  badge: BadgeDefinition;
  week: number;
  recipients: BadgeSummaryRecipient[];
}

export interface BadgeSummary {
  week: number;
  groups: BadgeSummaryGroup[];
}

export function createBadgeSummary(edition: WeeklyEdition): BadgeSummary {
  const entriesById = new Map(edition.entries.map((entry) => [entry.teamId, entry]));
  const awardsByPair = new Map<string, (typeof edition.badges)[number]>();

  for (const award of edition.badges) {
    if (!badgeById.has(award.badgeId)) throw new Error(`Unknown badge: ${award.badgeId}`);
    if (!entriesById.has(award.teamId)) throw new Error(`Unknown team: ${award.teamId}`);
    const key = `${award.badgeId}:${award.teamId}`;
    if (awardsByPair.has(key)) throw new Error(`Duplicate badge award: ${key}`);
    awardsByPair.set(key, award);
  }

  for (const entry of edition.entries) {
    const awarded = edition.badges
      .filter((award) => award.teamId === entry.teamId)
      .map((award) => award.badgeId)
      .sort();
    const referenced = [...entry.badgeIds].sort();
    if (awarded.join('\0') !== referenced.join('\0'))
      throw new Error(`Badge references disagree for team ${entry.teamId}`);
  }

  const groups = badgeCatalog.flatMap((badge): BadgeSummaryGroup[] => {
    const recipients = edition.entries.flatMap((entry): BadgeSummaryRecipient[] => {
      const award = awardsByPair.get(`${badge.badgeId}:${entry.teamId}`);
      return award
        ? [
            {
              teamId: entry.teamId,
              displayName: entry.displayName,
              rank: entry.rank,
              reason: award.reason,
            },
          ]
        : [];
    });
    return recipients.length > 0 ? [{ badge, week: edition.week.number, recipients }] : [];
  });

  return { week: edition.week.number, groups };
}
