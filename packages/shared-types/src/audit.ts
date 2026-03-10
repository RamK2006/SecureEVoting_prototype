export enum AuditEventType {
  VOTER_REGISTERED = 'voter_registered',
  VOTER_LOGIN = 'voter_login',
  TOKEN_ISSUED = 'token_issued',
  VOTE_CAST = 'vote_cast',
  VOTE_VERIFIED = 'vote_verified',
  ELECTION_CREATED = 'election_created',
  ELECTION_STARTED = 'election_started',
  ELECTION_ENDED = 'election_ended',
  RESULTS_FINALIZED = 'results_finalized',
  SECURITY_VIOLATION = 'security_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  eventType: AuditEventType;
  actorHash?: string;
  resourceId?: string;
  action: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: AuditSeverity;
}

export interface VerificationResult {
  verified: boolean;
  voteId?: string;
  blockNumber?: number;
  transactionHash?: string;
  timestamp?: Date;
  confirmations?: number;
  constituencyId?: string;
  blockchainProof?: BlockchainProof;
  message: string;
}

export interface BlockchainProof {
  blockHash: string;
  transactionIndex: number;
  encryptedVoteHash: string;
}

export interface BlockDetails {
  blockNumber: number;
  blockHash: string;
  timestamp: Date;
  transactionCount: number;
  parentHash: string;
}
