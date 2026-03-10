// Re-export from vote.ts to avoid duplicates
import type { EncryptedVote, ZKProof, PublicInputs } from './vote';

export interface CryptoService {
  encryptVote(vote: unknown, publicKey: string): Promise<EncryptedVote>;
  decryptVote(encryptedVote: EncryptedVote, privateKey: string): Promise<unknown>;
  generateZKProof(vote: unknown, randomness: string): Promise<ZKProof>;
  verifyZKProof(proof: ZKProof, publicInputs: PublicInputs): Promise<boolean>;
  generateAnonymousToken(): string;
  hashVoterIdentity(nationalId: string): string;
}

export type { EncryptedVote, ZKProof, PublicInputs } from './vote';

export interface TallyState {
  electionId: string;
  candidates: string[];
  counts: Record<string, number>;
  processedVotes: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}
