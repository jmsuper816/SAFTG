export function espnFixture() {
  return {
    id: 'league-1',
    seasonId: 2026,
    settings: { name: 'Tuesday League' },
    status: { currentMatchupPeriod: 2 },
    teams: [
      {
        id: 1,
        location: 'Gridiron',
        nickname: 'Owls',
        abbreviation: 'OWL',
        record: { overall: { wins: 1, losses: 0, ties: 0, pointsFor: 120, pointsAgainst: 90 } },
      },
      {
        id: 2,
        location: 'Sunday',
        nickname: 'Sharks',
        abbreviation: 'SHRK',
        record: { overall: { wins: 0, losses: 1, ties: 0, pointsFor: 90, pointsAgainst: 120 } },
      },
    ],
    schedule: [
      {
        id: 1,
        matchupPeriodId: 1,
        winner: 'HOME',
        home: { teamId: 1, totalPoints: 120 },
        away: { teamId: 2, totalPoints: 90 },
      },
    ],
  };
}

export const incompleteFixture = () => ({
  ...espnFixture(),
  schedule: [{ ...espnFixture().schedule[0], winner: 'UNDECIDED' }],
});
export const tiedFixture = () => ({
  ...espnFixture(),
  schedule: [
    {
      ...espnFixture().schedule[0],
      winner: 'TIE',
      home: { teamId: 1, totalPoints: 100 },
      away: { teamId: 2, totalPoints: 100 },
    },
  ],
});
export const byeFixture = () => ({
  ...espnFixture(),
  schedule: [{ id: 1, matchupPeriodId: 1, winner: 'BYE', home: { teamId: 1, totalPoints: 0 } }],
});
export const duplicateTeamFixture = () => ({
  ...espnFixture(),
  teams: [espnFixture().teams[0], espnFixture().teams[0]],
});
export const renamedTeamFixture = () => ({
  ...espnFixture(),
  teams: [
    { ...espnFixture().teams[0], location: 'Renamed', nickname: 'Owls' },
    espnFixture().teams[1],
  ],
});
