import type { PublisherType } from './types.ts';

const nflHosts = new Set(['nfl.com', 'www.nfl.com', 'operations.nfl.com']);
const teamHostPattern = /^(?:www\.)?[a-z0-9-]+\.com$/i;

export function assertOfficialPublisher(
  publisherType: PublisherType,
  publisher: string,
  rawUrl: string,
): void {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash)
    throw new Error(`Source ${rawUrl} must be a credential-free HTTPS URL without a fragment`);
  const host = url.hostname.toLowerCase();
  if (publisherType === 'nfl' && !nflHosts.has(host))
    throw new Error(`Unsupported official NFL host: ${host}`);
  if (publisherType === 'team' && !teamHostPattern.test(host))
    throw new Error(`Unsupported official team host: ${host}`);
  if (!publisher.trim()) throw new Error('Official publisher name is required');
}
