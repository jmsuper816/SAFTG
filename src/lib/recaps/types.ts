export type LineupStatus = 'started' | 'bench';
export type PublisherType = 'nfl' | 'team';

export interface RecapCutoff {
  previous: string;
  current: string;
}

export interface LineupEvidence {
  evidenceId: string;
  teamId: string;
  playerId: string;
  playerName: string;
  lineupStatus: LineupStatus;
  fantasyPoints: number;
  observedStatement: string;
  factIds: string[];
}

export interface FootballNewsSource {
  sourceId: string;
  publisherType: PublisherType;
  publisher: string;
  url: string;
  title: string;
  publishedAt: string;
  updatedAt: string | null;
  accessedAt: string;
  subjects: string[];
  summary: string;
}

export interface RecapEvidenceManifest {
  schemaVersion: 1;
  editionId: string;
  cutoff: RecapCutoff;
  leagueFactIds: string[];
  lineupEvidence: LineupEvidence[];
  newsSources: FootballNewsSource[];
  commissionerNoteDigests: string[];
}

export interface EvidenceReference {
  paragraphIndex: number;
  factIds: string[];
  sourceIds: string[];
}

export interface GenerationMetadata {
  generatedAt: string;
  provider: 'openai';
  configuredModel: string;
  responseModel: string;
  requestId: string;
  promptVersion: number;
  inputDigest: string;
}

export interface RecapApproval {
  status: 'approved';
  commissioner: string;
  approvedAt: string;
  contentDigest: string;
}

export interface WeeklyRecap {
  schemaVersion: 1;
  editionId: string;
  paragraphs: string[];
  evidenceRefs: EvidenceReference[];
  warnings: string[];
  generation: GenerationMetadata;
  approval: RecapApproval | null;
}

export interface GeneratedRecapContent {
  paragraphs: string[];
  evidenceRefs: EvidenceReference[];
  warnings: string[];
}

export interface PublishedRecap {
  editionId: string;
  paragraphs: string[];
}
