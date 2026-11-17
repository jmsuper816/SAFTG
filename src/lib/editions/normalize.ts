import { editionSchema } from '../domain/schemas.ts';
import type {
  CommissionerRanking,
  DraftRanking,
  EspnWeekSnapshot,
  WeeklyEdition,
} from '../domain/types.ts';
import { evaluateBadges } from '../badges/evaluate.ts';
import { assertCompleteRanking } from './load-ranking.ts';
import { rankMovement, winningStreak } from './movement.ts';

function recordForWeek(
  previous: WeeklyEdition | null,
  teamId: string,
  snapshotRecord: EspnWeekSnapshot['teams'][number]['record'],
  matchups: EspnWeekSnapshot['matchups'],
  snapshotWeek: number,
) {
  const previousEntry = previous?.entries.find((entry) => entry.teamId === teamId);
  const matchup = matchups.find((item) => item.homeTeamId === teamId || item.awayTeamId === teamId);
  if (!previous || !previousEntry || !matchup || previous.week.number + 1 !== snapshotWeek)
    return snapshotRecord;

  const isHome = matchup.homeTeamId === teamId;
  const score = isHome ? matchup.homeScore : matchup.awayScore;
  const opponentScore = isHome ? matchup.awayScore : matchup.homeScore;
  if (score === null || opponentScore === null) return snapshotRecord;

  return {
    wins: previousEntry.record.wins + (score > opponentScore ? 1 : 0),
    losses: previousEntry.record.losses + (score < opponentScore ? 1 : 0),
    ties: previousEntry.record.ties + (score === opponentScore ? 1 : 0),
    pointsFor: previousEntry.record.pointsFor + score,
    pointsAgainst: previousEntry.record.pointsAgainst + opponentScore,
  };
}

export interface NormalizeOptions {
  timezone: string;
  submissionPath: string;
  publishedAt: string;
  previous: WeeklyEdition | null;
  draftRanking?: DraftRanking | null;
}

export function normalizeEdition(
  ranking: CommissionerRanking,
  snapshot: EspnWeekSnapshot,
  options: NormalizeOptions,
): WeeklyEdition {
  if (!snapshot.status.isFinal || snapshot.matchups.some((matchup) => !matchup.isFinal))
    throw new Error('ESPN results are not final');
  if (
    ranking.leagueId !== snapshot.league.leagueId ||
    ranking.season !== snapshot.league.season ||
    ranking.week !== snapshot.status.week
  )
    throw new Error('Ranking and ESPN source do not match');
  assertCompleteRanking(
    ranking,
    snapshot.teams.map((team) => team.teamId),
  );
  if (options.draftRanking) {
    if (
      options.draftRanking.leagueId !== snapshot.league.leagueId ||
      options.draftRanking.season !== snapshot.league.season
    )
      throw new Error('Draft ranking and ESPN source do not match');
    const draftIds = options.draftRanking.rankings.map(({ teamId }) => teamId).sort();
    const teamIds = snapshot.teams.map(({ teamId }) => teamId).sort();
    if (draftIds.join('\0') !== teamIds.join('\0'))
      throw new Error('Draft ranking must include every active team exactly once');
  }
  const teamById = new Map(snapshot.teams.map((team) => [team.teamId, team]));
  const scoreById = new Map<string, number>();
  for (const matchup of snapshot.matchups) {
    scoreById.set(matchup.homeTeamId, matchup.homeScore);
    if (matchup.awayTeamId && matchup.awayScore !== null)
      scoreById.set(matchup.awayTeamId, matchup.awayScore);
  }
  const entries = ranking.rankings.map((item) => {
    const team = teamById.get(item.teamId)!;
    const record = recordForWeek(
      options.previous,
      team.teamId,
      team.record,
      snapshot.matchups,
      snapshot.status.week,
    );
    return {
      teamId: team.teamId,
      displayName: team.displayName,
      rank: item.rank,
      ...rankMovement(options.previous, team.teamId, item.rank, options.draftRanking),
      record,
      weeklyScore: scoreById.get(team.teamId) ?? 0,
      winningStreak: winningStreak(options.previous, team.teamId, record.wins),
      explanation: item.explanation,
      badgeIds: [] as string[],
    };
  });
  const badges = evaluateBadges(entries, snapshot.matchups);
  for (const entry of entries)
    entry.badgeIds = badges
      .filter((award) => award.teamId === entry.teamId)
      .map((award) => award.badgeId);
  return editionSchema.parse({
    schemaVersion: 1,
    editionId: `${ranking.leagueId}-${ranking.season}-week-${String(ranking.week).padStart(2, '0')}`,
    league: {
      leagueId: ranking.leagueId,
      name: snapshot.league.name,
      season: ranking.season,
      timezone: options.timezone,
    },
    week: {
      number: ranking.week,
      startsAt: snapshot.status.startsAt,
      endsAt: snapshot.status.endsAt,
      sourceStatus: 'final',
    },
    publishedAt: options.publishedAt,
    rankingSource: {
      type: 'commissioner',
      commissioner: ranking.commissioner,
      submissionPath: options.submissionPath,
    },
    entries,
    badges,
    previousEditionId: options.previous?.editionId ?? null,
  }) as WeeklyEdition;
}
