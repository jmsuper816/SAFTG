import { describe, expect, it } from 'vitest';
import { EMPTY_BADGE_SUMMARY_MESSAGE, createBadgeSummary } from '../../src/lib/badges/summary';
import { badgeSummaryEdition } from '../fixtures/editions/badge-summary';

describe('badge summary projection', () => {
  it('groups by catalog order and recipients by edition-entry order', () => {
    const summary = createBadgeSummary(badgeSummaryEdition());
    expect(summary.groups.map((group) => group.badge.badgeId)).toEqual([
      'scoreboard-scorcher',
      'basement-dweller',
      'hot-streak',
    ]);
    expect(summary.groups[0]?.recipients.map((recipient) => recipient.teamId)).toEqual(['1', '2']);
    expect(summary.groups.flatMap((group) => group.recipients)).toHaveLength(4);
    expect(
      summary.groups.filter((group) => group.recipients.some((item) => item.teamId === '1')),
    ).toHaveLength(2);
  });

  it('returns the explicit empty state without leaking prior groups', () => {
    expect(createBadgeSummary(badgeSummaryEdition()).groups).not.toHaveLength(0);
    const empty = badgeSummaryEdition();
    empty.badges = [];
    empty.entries.forEach((entry) => (entry.badgeIds = []));
    expect(createBadgeSummary(empty)).toEqual({ week: 1, groups: [] });
    expect(EMPTY_BADGE_SUMMARY_MESSAGE).toBe('No badges were awarded this week.');
  });

  it('rejects unknown badges, teams, duplicate pairs, and inconsistent references', () => {
    const unknownBadge = badgeSummaryEdition();
    unknownBadge.badges[0]!.badgeId = 'unknown-badge';
    expect(() => createBadgeSummary(unknownBadge)).toThrow(/Unknown badge/);

    const unknownTeam = badgeSummaryEdition();
    unknownTeam.badges[0]!.teamId = 'missing-team';
    expect(() => createBadgeSummary(unknownTeam)).toThrow(/Unknown team/);

    const duplicate = badgeSummaryEdition();
    duplicate.badges.push({ ...duplicate.badges[0]! });
    expect(() => createBadgeSummary(duplicate)).toThrow(/Duplicate badge award/);

    const inconsistent = badgeSummaryEdition();
    inconsistent.entries[0]!.badgeIds = [];
    expect(() => createBadgeSummary(inconsistent)).toThrow(/Badge references disagree/);
  });
});
