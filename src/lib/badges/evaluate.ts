import type { BadgeAward, Matchup, RankingEntry } from '../domain/types.ts';

const tiedExtrema = (
  values: Array<{ teamId: string; value: number }>,
  direction: 'max' | 'min',
) => {
  if (!values.length) return [];
  const target = Math[direction](...values.map((item) => item.value));
  return values.filter((item) => item.value === target);
};

export function evaluateBadges(entries: RankingEntry[], matchups: Matchup[]): BadgeAward[] {
  const awards: BadgeAward[] = [];
  const scores = entries.map((entry) => ({ teamId: entry.teamId, value: entry.weeklyScore }));
  for (const item of tiedExtrema(scores, 'max'))
    awards.push({
      badgeId: 'scoreboard-scorcher',
      teamId: item.teamId,
      reason: `Led the league with ${item.value.toFixed(2)} points.`,
      metric: item.value,
    });
  for (const item of tiedExtrema(scores, 'min'))
    awards.push({
      badgeId: 'basement-dweller',
      teamId: item.teamId,
      reason: `Posted the week's low score of ${item.value.toFixed(2)}.`,
      metric: item.value,
    });

  const wins = matchups
    .filter((m) => m.winnerTeamId && m.awayTeamId)
    .map((m) => {
      const margin = Math.abs(m.homeScore - (m.awayScore ?? 0));
      return { teamId: m.winnerTeamId!, value: margin, matchup: m };
    });
  for (const item of tiedExtrema(wins, 'max'))
    awards.push({
      badgeId: 'steamroller',
      teamId: item.teamId,
      reason: `Won by ${item.value.toFixed(2)} points.`,
      metric: item.value,
    });
  for (const item of tiedExtrema(wins, 'min'))
    awards.push({
      badgeId: 'photo-finish',
      teamId: item.teamId,
      reason: `Survived a ${item.value.toFixed(2)}-point finish.`,
      metric: item.value,
    });

  const byId = new Map(entries.map((entry) => [entry.teamId, entry]));
  const upsets = wins.flatMap((win) => {
    const loser =
      win.matchup.homeTeamId === win.teamId ? win.matchup.awayTeamId : win.matchup.homeTeamId;
    const winnerRank = byId.get(win.teamId)?.previousRank;
    const loserRank = loser ? byId.get(loser)?.previousRank : null;
    return winnerRank && loserRank && winnerRank > loserRank
      ? [{ teamId: win.teamId, value: winnerRank - loserRank }]
      : [];
  });
  for (const item of tiedExtrema(upsets, 'max'))
    awards.push({
      badgeId: 'giant-slayer',
      teamId: item.teamId,
      reason: `Beat a team ranked ${item.value} place${item.value === 1 ? '' : 's'} higher.`,
      metric: item.value,
    });

  const streaks = entries
    .filter((entry) => entry.winningStreak > 0)
    .map((entry) => ({ teamId: entry.teamId, value: entry.winningStreak }));
  for (const item of tiedExtrema(streaks, 'max'))
    awards.push({
      badgeId: 'hot-streak',
      teamId: item.teamId,
      reason: `Extended a ${item.value}-game winning streak.`,
      metric: item.value,
    });

  const losers = wins.flatMap((win) => {
    const loser =
      win.matchup.homeTeamId === win.teamId ? win.matchup.awayTeamId : win.matchup.homeTeamId;
    return loser ? [{ teamId: loser, value: byId.get(loser)?.weeklyScore ?? 0 }] : [];
  });
  for (const item of tiedExtrema(losers, 'max'))
    awards.push({
      badgeId: 'hard-luck-hero',
      teamId: item.teamId,
      reason: `Scored ${item.value.toFixed(2)} points and still lost.`,
      metric: item.value,
    });
  return awards;
}
