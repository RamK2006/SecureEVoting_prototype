export interface Voter {
  id: string;
  voterHash: string;
  constituencyId: string;
  registeredAt: Date;
  hasVoted: boolean;
  voterAddress?: string;
}

export interface VoterStatus {
  eligible: boolean;
  hasVoted: boolean;
  constituencyId: string;
  canRevote: boolean;
  lastVoteTime?: Date;
}

export interface EligibilityStatus {
  eligible: boolean;
  reason?: string;
  constituencyId?: string;
}
