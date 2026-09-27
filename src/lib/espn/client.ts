export type EspnFailureKind =
  'network' | 'timeout' | 'rate-limit' | 'http' | 'content-type' | 'validation' | 'authentication';
export class EspnError extends Error {
  public kind: EspnFailureKind;
  public attempts: number;

  constructor(kind: EspnFailureKind, message: string, attempts: number) {
    super(message);
    this.kind = kind;
    this.attempts = attempts;
  }
}

export interface EspnRequest {
  leagueId: string;
  season: number;
  week: number;
  timeoutMs: number;
  maxAttempts: number;
}
export interface EspnClientOptions {
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  logger?: (metadata: Record<string, unknown>) => void;
}

export async function fetchEspnLeague(
  request: EspnRequest,
  options: EspnClientOptions = {},
): Promise<unknown> {
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const url = new URL(
    `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${request.season}/segments/0/leagues/${encodeURIComponent(request.leagueId)}`,
  );
  url.searchParams.set('scoringPeriodId', String(request.week));
  for (const view of ['mTeam', 'mMatchupScore', 'mStandings', 'mSettings', 'mStatus'])
    url.searchParams.append('view', view);

  let last: EspnError = new EspnError('network', 'ESPN request did not run', 0);
  for (let attempt = 1; attempt <= request.maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), request.timeoutMs);
    try {
      const response = await fetcher(url, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });
      const type = response.headers.get('content-type') ?? '';
      if (response.status === 401 || response.status === 403)
        throw new EspnError('authentication', 'Public league requires authentication', attempt);
      if (response.status === 429)
        throw new EspnError('rate-limit', 'ESPN rate limited the request', attempt);
      if (!response.ok)
        throw new EspnError('http', `ESPN returned HTTP ${response.status}`, attempt);
      if (!type.includes('application/json'))
        throw new EspnError('content-type', 'ESPN did not return JSON', attempt);
      return await response.json();
    } catch (error) {
      last =
        error instanceof EspnError
          ? error
          : new EspnError(
              error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'network',
              'ESPN request failed',
              attempt,
            );
      options.logger?.({
        kind: last.kind,
        leagueId: request.leagueId,
        season: request.season,
        week: request.week,
        attempt,
      });
      if (['authentication', 'content-type'].includes(last.kind) || attempt === request.maxAttempts)
        throw last;
      await sleep(Math.min(250 * 2 ** (attempt - 1) + Math.floor(Math.random() * 100), 2_000));
    } finally {
      clearTimeout(timer);
    }
  }
  throw last;
}
