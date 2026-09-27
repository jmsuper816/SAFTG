import type { EspnWeekSnapshot, Matchup, Team } from '../domain/types.ts';
import { espnResponseSchema } from './schema.ts';

const cleanName = (name?: string, location?: string, nickname?: string) =>
  (name?.trim() || `${location ?? ''} ${nickname ?? ''}`.trim()).slice(0, 60) || 'Unnamed Team';

export function normalizeEspnResponse(
  raw: unknown,
  requested: { leagueId: string; season: number; week: number; timezone: string },
): EspnWeekSnapshot {
  const value = espnResponseSchema.parse(raw);
  if (String(value.id) !== requested.leagueId || value.seasonId !== requested.season)
    throw new Error('ESPN response league or season mismatch');
  const teamIds = new Set<string>();
  const teams: Team[] = value.teams.map((team) => {
    const teamId = String(team.id);
    if (teamIds.has(teamId)) throw new Error(`Duplicate ESPN team ${teamId}`);
    teamIds.add(teamId);
    const overall = team.record.overall;
    return {
      teamId,
      displayName: cleanName(team.name, team.location, team.nickname),
      abbreviation: team.abbreviation?.slice(0, 8) ?? null,
      logoUrl: team.logo ?? null,
      record: {
        wins: overall.wins,
        losses: overall.losses,
        ties: overall.ties,
        pointsFor: overall.pointsFor,
        pointsAgainst: overall.pointsAgainst,
      },
    };
  });
  const schedule = value.schedule.filter((item) => item.matchupPeriodId === requested.week);
  const seen = new Set<string>();
  const matchups: Matchup[] = schedule.map((item) => {
    const homeTeamId = String(item.home.teamId);
    const awayTeamId = item.away ? String(item.away.teamId) : null;
    if (!teamIds.has(homeTeamId) || (awayTeamId && !teamIds.has(awayTeamId)))
      throw new Error('Matchup references unknown team');
    if (seen.has(homeTeamId) || (awayTeamId && seen.has(awayTeamId)))
      throw new Error('Team appears in multiple matchups');
    seen.add(homeTeamId);
    if (awayTeamId) seen.add(awayTeamId);
    const winnerTeamId =
      item.winner === 'HOME' ? homeTeamId : item.winner === 'AWAY' ? awayTeamId : null;
    return {
      matchupId: String(item.id),
      homeTeamId,
      awayTeamId,
      homeScore: item.home.totalPoints,
      awayScore: item.away?.totalPoints ?? null,
      winnerTeamId,
      isFinal: item.winner !== undefined && item.winner !== 'UNDECIDED',
    };
  });
  const isFinal = matchups.length > 0 && matchups.every((item) => item.isFinal);
  const now = new Date();
  return {
    league: {
      leagueId: String(value.id),
      name: value.settings.name,
      season: value.seasonId,
      timezone: requested.timezone,
    },
    status: {
      week: requested.week,
      isFinal,
      startsAt: new Date(Date.UTC(requested.season, 0, 1 + (requested.week - 1) * 7)).toISOString(),
      endsAt: now.toISOString(),
    },
    teams,
    matchups,
  };
}
