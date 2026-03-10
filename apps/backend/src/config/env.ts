import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'SYSTEM_SALT',
  'ENCRYPTION_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Export configuration
export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || './data/securevote.db',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Blockchain
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
  voterRegistryAddress: process.env.VOTER_REGISTRY_ADDRESS || '',
  voteLedgerAddress: process.env.VOTE_LEDGER_ADDRESS || '',
  electionManagerAddress: process.env.ELECTION_MANAGER_ADDRESS || '',
  
  // Crypto
  systemSalt: process.env.SYSTEM_SALT || 'dev-salt-change-in-production',
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-key-change-in-production',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  voteRateLimitMax: parseInt(process.env.VOTE_RATE_LIMIT_MAX || '5', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:19006', 'http://localhost:3001'],
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  tokenTtlMinutes: parseInt(process.env.TOKEN_TTL_MINUTES || '30', 10),
  revotingWindowMinutes: parseInt(process.env.REVOTING_WINDOW_MINUTES || '30', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Development flags
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

// Validate configuration
export const validateConfig = (): void => {
  if (config.isProduction) {
    if (config.jwtSecret === 'dev-secret-change-in-production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    if (config.systemSalt === 'dev-salt-change-in-production') {
      throw new Error('SYSTEM_SALT must be set in production');
    }
    if (config.encryptionKey === 'dev-key-change-in-production') {
      throw new Error('ENCRYPTION_KEY must be set in production');
    }
  }
};

export default config;
