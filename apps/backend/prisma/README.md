# Database Documentation

## Overview

The SecureVote backend uses **Prisma ORM** with **SQLite** for development. The database schema is designed to support secure voter registration, anonymous voting, and comprehensive audit logging while ensuring no PII is stored on the blockchain or in logs.

## Database Models

### 1. Voter
Stores voter registration data with hashed identifiers only.

**Fields:**
- `id`: UUID (internal DB only)
- `voterHash`: SHA256(nationalId + salt) - unique identifier
- `constituencyId`: Geographic constituency
- `registeredAt`: Registration timestamp
- `hasVoted`: Boolean flag (synced from blockchain)
- `voterAddress`: Ethereum address (optional)

**Indexes:**
- `voterHash` (unique)
- `constituencyId`

### 2. AuthCredentials
Stores authentication data for voters.

**Fields:**
- `id`: UUID
- `voterHash`: Foreign key to Voter
- `passwordHash`: bcrypt hash (cost factor 12)
- `otpSecret`: TOTP secret for 2FA (simulation)
- `lastLogin`: Last login timestamp
- `failedAttempts`: Failed login counter (max 5)
- `lockedUntil`: Account lock expiration

**Indexes:**
- `voterHash` (unique)

### 3. VotingToken
Temporary anonymous tokens for vote submission. Purged immediately after use.

**Fields:**
- `token`: UUID v4 (anonymous identifier)
- `voterHash`: Temporary mapping to voter
- `electionId`: Foreign key to Election
- `constituencyId`: Constituency identifier
- `issuedAt`: Token creation timestamp
- `expiresAt`: Token expiration (30 minutes TTL)
- `used`: Boolean flag

**Indexes:**
- `voterHash`
- `electionId`
- `expiresAt`

### 4. VoteReceipt
Public receipts for vote verification.

**Fields:**
- `receiptId`: UUID (public identifier)
- `voteId`: Blockchain vote ID (bytes32)
- `blockNumber`: Block where vote was recorded
- `transactionHash`: Ethereum transaction hash
- `timestamp`: Vote submission timestamp
- `constituencyId`: Constituency identifier
- `zkProofHash`: SHA256 of ZK proof
- `verificationUrl`: Public audit portal URL
- `electionId`: Foreign key to Election

**Indexes:**
- `voteId` (unique)
- `electionId`
- `constituencyId`

### 5. Election
Election configuration and metadata.

**Fields:**
- `id`: UUID
- `blockchainId`: bytes32 from ElectionManager contract
- `name`: Election name
- `description`: Election description
- `startTime`: Election start timestamp
- `endTime`: Election end timestamp
- `status`: draft | active | ended | finalized
- `allowRevoting`: Boolean flag
- `revotingWindowMinutes`: Re-voting window (default 30)
- `createdBy`: Admin user ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- `blockchainId` (unique)
- `status`
- `startTime`
- `endTime`

### 6. Candidate
Candidate information for elections.

**Fields:**
- `id`: UUID
- `electionId`: Foreign key to Election
- `name`: Candidate name
- `party`: Political party
- `constituencyId`: Constituency identifier
- `photoUrl`: Photo URL (optional)
- `manifesto`: Candidate manifesto (optional)
- `createdAt`: Creation timestamp

**Indexes:**
- `electionId`
- `constituencyId`

### 7. AuditLog
Comprehensive audit trail with no PII.

**Fields:**
- `id`: UUID
- `eventType`: Event type (voter_registered, vote_cast, etc.)
- `actorHash`: Hashed actor identity (optional)
- `resourceId`: Related resource ID (optional)
- `action`: Action description
- `metadata`: JSON string with additional context
- `ipAddress`: Hashed IP address
- `userAgent`: User agent string
- `timestamp`: Event timestamp
- `severity`: info | warning | critical

**Indexes:**
- `eventType`
- `actorHash`
- `resourceId`
- `timestamp`
- `severity`

## Database Commands

### Initialize Database
```bash
npm run db:migrate
```

### Generate Prisma Client
```bash
npm run db:generate
```

### Seed Database with Test Data
```bash
npm run db:seed
```

### Reset Database (WARNING: Deletes all data)
```bash
npm run db:reset
```

## Test Data

The seed script creates:
- 1 test election with 5 candidates across 2 constituencies
- 3 test voters with credentials:
  - National ID: `123456789012`, Password: `TestPass123!` (const-001)
  - National ID: `123456789013`, Password: `TestPass123!` (const-001)
  - National ID: `123456789014`, Password: `TestPass123!` (const-002)

## Security Considerations

1. **No PII Storage**: National IDs are never stored in plaintext. Only SHA256 hashes are stored.

2. **Password Security**: All passwords are hashed using bcrypt with cost factor 12.

3. **Token Purging**: Anonymous voting tokens are purged immediately after vote submission to prevent linking votes to voters.

4. **Audit Logging**: All critical events are logged with hashed identifiers only. IP addresses are also hashed.

5. **Index Optimization**: Strategic indexes on frequently queried fields (voterHash, electionId, etc.) ensure fast lookups.

## Migration History

- `20260309203119_init`: Initial schema with all models and indexes

## Production Considerations

For production deployment:
1. Switch from SQLite to PostgreSQL
2. Update `DATABASE_URL` in `.env` to PostgreSQL connection string
3. Update `prisma/schema.prisma` datasource provider to `postgresql`
4. Run migrations: `npm run db:migrate`
5. Ensure proper database backups and replication
6. Configure connection pooling for high concurrency
