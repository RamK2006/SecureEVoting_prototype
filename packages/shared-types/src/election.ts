export type ElectionStatus = 'draft' | 'active' | 'ended' | 'finalized';

export interface Election {
  id: string;
  blockchainId: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: ElectionStatus;
  candidates: Candidate[];
  constituencies: string[];
  allowRevoting: boolean;
  revotingWindowMinutes: number;
  createdBy: string;
  publicKey?: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  constituencyId: string;
  photoUrl?: string;
  manifesto?: string;
}

export interface ElectionConfig {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  constituencies: string[];
  candidates: Candidate[];
  allowRevoting: boolean;
  revotingWindowMinutes: number;
}

export interface ElectionStats {
  electionId: string;
  totalVotes: number;
  turnoutByConstituency: Record<string, number>;
  lastUpdated: Date;
}

export interface FinalResults {
  electionId: string;
  candidates: CandidateResult[];
  totalVotes: number;
  finalizedAt: Date;
  metadata: {
    tallyMethod: string;
    note?: string;
  };
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  party: string;
  constituencyId: string;
  voteCount: number;
  percentage: number;
}

export interface ConstituencyStats {
  constituencyId: string;
  totalVotes: number;
  registeredVoters: number;
  turnoutPercentage: number;
}
