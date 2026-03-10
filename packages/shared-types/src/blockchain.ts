// Import types to use in interfaces
import type { 
  VoteSubmissionResult, 
  EncryptedVoteRecord 
} from './vote';

import type { 
  ElectionConfig, 
  FinalResults
} from './election';

export interface TransactionReceipt {
  status: 'success' | 'failed';
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: number;
  voterAddress?: string;
}

export interface BlockchainService {
  registerVoter(voterHash: string, constituencyId: string): Promise<TransactionReceipt>;
  isEligible(voterHash: string): Promise<boolean>;
  hasVoted(voterHash: string): Promise<boolean>;
  markVoted(voterHash: string): Promise<TransactionReceipt>;
  submitVote(
    anonymousToken: string,
    encryptedVote: string,
    zkProof: string,
    constituencyId: string
  ): Promise<VoteSubmissionResult>;
  getVote(voteId: string): Promise<EncryptedVoteRecord>;
  getConstituencyTally(constituencyId: string): Promise<number>;
  createElection(config: ElectionConfig): Promise<string>;
  startElection(electionId: string): Promise<TransactionReceipt>;
  endElection(electionId: string): Promise<TransactionReceipt>;
  finalizeResults(electionId: string, results: FinalResults): Promise<TransactionReceipt>;
  getElectionStatus(electionId: string): Promise<ElectionStatusResponse>;
  getCurrentBlockNumber(): Promise<number>;
}

export interface ElectionStatusResponse {
  name: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isFinalized: boolean;
}

// Re-export from other files to avoid duplicates
export type { 
  VoteSubmissionResult, 
  EncryptedVoteRecord 
} from './vote';

export type { 
  ElectionConfig, 
  Candidate, 
  FinalResults, 
  CandidateResult 
} from './election';
