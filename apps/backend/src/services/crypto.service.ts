import crypto from 'crypto';
import bcrypt from 'bcrypt';
import config from '../config/env';

class CryptoService {
  // Hash voter identity (SHA256 with system salt)
  hashVoterIdentity(nationalId: string): string {
    return crypto
      .createHash('sha256')
      .update(nationalId + config.systemSalt)
      .digest('hex');
  }

  // Hash password with bcrypt
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, config.bcryptRounds);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate anonymous token (UUID v4)
  generateAnonymousToken(): string {
    return crypto.randomUUID();
  }

  // Encrypt vote (AES-256-GCM)
  encryptVote(vote: any): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(config.encryptionKey, 'hex');
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(vote), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Generate ZK proof (SHA256-based simulation for MVP)
  generateZKProof(vote: any): string {
    const randomness = crypto.randomBytes(32).toString('hex');
    const voteString = JSON.stringify(vote);
    
    const commitment = crypto
      .createHash('sha256')
      .update(voteString + randomness)
      .digest('hex');
    
    const challenge = crypto
      .createHash('sha256')
      .update(commitment + 'challenge_salt')
      .digest('hex');
    
    const response = crypto
      .createHash('sha256')
      .update(randomness + challenge)
      .digest('hex');
    
    return JSON.stringify({
      commitment,
      challenge,
      response,
      proofType: 'sha256-simulation',
      note: 'MVP simulation - replace with real ZK-SNARKs in production'
    });
  }

  // Verify ZK proof (simulation)
  verifyZKProof(proof: string): boolean {
    try {
      const parsed = JSON.parse(proof);
      return parsed.proofType === 'sha256-simulation';
    } catch {
      return false;
    }
  }

  // Hash for blockchain (keccak256 equivalent)
  hashForBlockchain(data: string): string {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default new CryptoService();
