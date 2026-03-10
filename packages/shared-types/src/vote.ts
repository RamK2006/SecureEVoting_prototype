export interface Vote {
  candidateId: string;
  electionId: string;
  timestamp: number;
  constituencyId: string;
}

export interface EncryptedVote {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

export interface VoteSubmission {
  anonymousToken: string;
  encryptedVote: string;
  zkProof: ZKProof;
  constituencyId: string;
}

export interface VoteReceipt {
  receiptId: string;
  voteId: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  constituencyId: string;
  zkProofHash: string;
  verificationUrl: string;
}

export interface VotingToken {
  token: string;
  voterHash: string;
  electionId: string;
  constituencyId: string;
  issuedAt: Date;
  expiresAt: Date;
  used: boolean;
}

export interface PreparedVote {
  vote: Vote;
  encryptedVote: EncryptedVote;
  zkProof: ZKProof;
}

export interface ZKProof {
  commitment: string;
  challenge: string;
  response: string;
  proofType: string;
  version: string;
  metadata: {
    note: string;
    productionNote: string;
  };
}

export interface PublicInputs {
  electionId: string;
  constituencyId: string;
  timestamp: number;
}

export interface VoteSubmissionResult {
  success: boolean;
  voteId: string;
  blockNumber: number;
  transactionHash: string;
}

export interface EncryptedVoteRecord {
  voteId: string;
  encryptedVote: string;
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  transactionIndex: number;
}

export interface VoteRecord {
  voteId: string;
  constituencyId: string;
  blockNumber: number;
  timestamp: Date;
  encryptedVoteHash: string;
}
