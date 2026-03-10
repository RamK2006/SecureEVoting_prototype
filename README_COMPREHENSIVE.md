# SecureVote - Blockchain-Based Electronic Voting System

## 🗳️ Overview

SecureVote is a production-ready MVP demonstrating a blockchain-based electronic voting system designed for national-scale elections. The system implements a **two-chain architecture** separating voter identity from vote records to ensure complete voter anonymity while maintaining election integrity and transparency.

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │  Audit Portal   │
│ React Native +  │◄──►│ Node.js +       │◄──►│ React + Vite    │
│ Expo            │    │ Express         │    │ Public Access   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Socket.IO      │              │
         └──────────────►│  Real-time      │◄─────────────┘
                        │  Updates        │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │ Blockchain Layer│
                        │                 │
                        │ ┌─────────────┐ │
                        │ │   Chain 1   │ │
                        │ │VoterRegistry│ │
                        │ │ (Identity)  │ │
                        │ └─────────────┘ │
                        │                 │
                        │ ┌─────────────┐ │
                        │ │   Chain 2   │ │
                        │ │ VoteLedger  │ │
                        │ │ (Anonymous) │ │
                        │ └─────────────┘ │
                        │                 │
                        │ ┌─────────────┐ │
                        │ │ElectionMgr  │ │
                        │ │(Lifecycle)  │ │
                        │ └─────────────┘ │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │ Hardhat Node    │
                        │ localhost:8545  │
                        └─────────────────┘
```

### Two-Chain Privacy Architecture

**Chain 1 (VoterRegistry)**: 
- Stores voter identity hashes and eligibility status
- Tracks who has voted (boolean flag)
- **Never stores vote content**

**Chain 2 (VoteLedger)**:
- Stores encrypted votes with anonymous tokens
- **Never stores voter identity**
- Enables public verification without revealing voter identity

This separation ensures that even with full blockchain access, votes cannot be linked to voters.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Git**
- **Expo Go** app on mobile device (for testing)

### Installation & Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd securevote-blockchain-evoting
   npm install
   ```

2. **Start Blockchain (Terminal 1)**
   ```bash
   cd apps/contracts
   npx hardhat node
   ```
   Keep this running - it provides the local blockchain at `localhost:8545`

3. **Deploy Smart Contracts (Terminal 2)**
   ```bash
   cd apps/contracts
   npm run deploy
   ```

4. **Start Backend API (Terminal 3)**
   ```bash
   cd apps/backend
   npm run dev
   ```
   API runs at `http://localhost:3000`

5. **Start Audit Portal (Terminal 4)**
   ```bash
   cd apps/audit-portal
   npm run dev
   ```
   Portal runs at `http://localhost:3001`

6. **Start Mobile App (Terminal 5)**
   ```bash
   cd apps/mobile
   npm start
   ```
   Scan QR code with Expo Go app

### Demo Credentials

- **National ID**: `123456789012`
- **Password**: `TestPass123!`
- **Constituency**: `const-001`

## 📱 Technology Stack

### Mobile App (React Native + Expo)
```json
{
  "framework": "React Native 0.73.6",
  "platform": "Expo SDK 50",
  "language": "TypeScript 5.3.3",
  "navigation": "@react-navigation/native 6.1.9",
  "security": "expo-secure-store 12.8.1",
  "crypto": "expo-crypto 12.8.1",
  "qr": "react-native-qrcode-svg 6.3.0",
  "realtime": "socket.io-client 4.6.1"
}
```

**Key Features:**
- Cross-platform (iOS/Android)
- Biometric authentication simulation
- Client-side vote encryption (AES-256-GCM)
- QR code generation for receipts
- Haptic feedback
- Real-time election statistics
- Device security checks

### Backend API (Node.js + Express)
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4.18.2",
  "language": "TypeScript 5.3.3",
  "database": "SQLite (dev) / PostgreSQL (prod)",
  "orm": "Prisma 5.7.1",
  "auth": "JWT + bcrypt",
  "blockchain": "Web3.js 4.3.0",
  "realtime": "Socket.IO 4.7.4",
  "security": "Helmet 7.1.0 + Rate Limiting",
  "logging": "Winston 3.11.0"
}
```

**Security Features:**
- JWT authentication with 24h expiration
- bcrypt password hashing (cost factor 12)
- Rate limiting: 100 req/15min (global), 5 req/min (voting)
- CORS protection
- Security headers via Helmet
- Input validation and sanitization
- Audit logging (no PII)

### Smart Contracts (Solidity + Hardhat)
```json
{
  "language": "Solidity 0.8.x",
  "framework": "Hardhat 2.19.5",
  "testing": "Chai + Mocha",
  "libraries": "@openzeppelin/contracts 5.0.1",
  "network": "Hardhat Local Node (Ethereum compatible)",
  "tools": "TypeChain for type generation"
}
```

**Contracts:**
- **VoterRegistry.sol**: Voter identity and eligibility management
- **VoteLedger.sol**: Anonymous encrypted vote storage
- **ElectionManager.sol**: Election lifecycle and results

### Audit Portal (React + Vite)
```json
{
  "framework": "React 18.2.0",
  "bundler": "Vite 5.0.12",
  "language": "TypeScript 5.3.3",
  "routing": "React Router 6.22.0",
  "qr": "react-qr-reader 3.0.0-beta-1",
  "realtime": "socket.io-client 4.6.1"
}
```

**Features:**
- Public receipt verification (no authentication)
- Real-time election statistics
- QR code scanning
- Blockchain proof display
- Constituency turnout visualization

## 🔐 Security Architecture

### Cryptographic Security

**Vote Encryption (AES-256-GCM)**:
```typescript
interface EncryptedVote {
  ciphertext: string;      // Hex-encoded encrypted vote
  iv: string;              // 12-byte initialization vector
  authTag: string;         // Authentication tag for integrity
  algorithm: 'aes-256-gcm';
}
```

**Zero-Knowledge Proofs (SHA256-based Simulation)**:
```typescript
interface ZKProof {
  commitment: string;      // SHA256(vote + randomness)
  challenge: string;       // SHA256(commitment + salt)
  response: string;        // SHA256(randomness + challenge)
  proofType: 'sha256-simulation';
  metadata: {
    note: 'Simulation for hackathon demo';
    productionNote: 'Replace with zk-SNARKs for production';
  };
}
```

**Identity Hashing**:
- National IDs hashed with SHA256 + system salt
- Never stored in plaintext
- Irreversible mapping

### Blockchain Security

**Two-Chain Separation**:
- Chain 1: `voterHash → {eligible, hasVoted, constituencyId}`
- Chain 2: `anonymousToken → {encryptedVote, zkProof, timestamp}`
- No cross-chain identity linking

**Smart Contract Security**:
- Access control for admin functions
- Event emission for transparency
- Gas optimization to prevent DoS
- Input validation and bounds checking

### API Security

**Authentication & Authorization**:
```typescript
// JWT payload structure
interface JWTPayload {
  voterHash: string;       // Hashed identity
  constituencyId: string;  // Voting district
  iat: number;            // Issued at
  exp: number;            // Expires at (24h)
}
```

**Rate Limiting**:
- Global: 100 requests per 15 minutes
- Vote casting: 5 requests per minute
- Login attempts: 5 failures = 30-minute lockout

**Security Headers**:
```typescript
// Helmet configuration
{
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: true,
  xssFilter: true
}
```

## 🗳️ Voting Process Flow

### Complete Voting Journey

```mermaid
sequenceDiagram
    participant V as Voter (Mobile)
    participant B as Backend API
    participant C1 as VoterRegistry (Chain 1)
    participant C2 as VoteLedger (Chain 2)
    participant A as Audit Portal

    Note over V,A: Phase 1: Registration & Authentication
    V->>B: POST /api/auth/register (nationalId, password)
    B->>C1: registerVoter(voterHash, constituencyId)
    C1-->>B: voterAddress
    B-->>V: Registration success

    V->>B: POST /api/auth/login (nationalId, password)
    B->>C1: isEligible(voterHash)
    C1-->>B: true
    B-->>V: JWT token

    Note over V,A: Phase 2: Vote Preparation
    V->>B: GET /api/voter/status (JWT)
    B->>C1: hasVoted(voterHash)
    C1-->>B: false
    B-->>V: Eligible to vote

    V->>B: POST /api/vote/token (JWT)
    B-->>V: anonymousToken (UUID)

    Note over V,A: Phase 3: Vote Encryption & Submission
    V->>V: Encrypt vote (AES-256-GCM)
    V->>V: Generate ZK proof (SHA256-based)
    
    V->>B: POST /api/vote/cast (anonymousToken, encryptedVote, zkProof)
    B->>C2: submitVote(anonymousToken, encryptedVote, zkProof)
    C2-->>B: voteId, blockNumber
    B->>C1: markVoted(voterHash)
    B-->>V: receipt (voteId, blockNumber, timestamp)

    Note over V,A: Phase 4: Public Verification
    V->>A: Verify receipt (public access)
    A->>B: GET /api/audit/verify/:receiptId
    B->>C2: getVote(voteId)
    C2-->>B: encryptedVote, blockNumber
    B-->>A: Verification result with blockchain proof
```

### Vote Encryption Process

```typescript
// Client-side vote encryption
async function encryptVote(vote: Vote, publicKey: string): Promise<EncryptedVote> {
  // 1. Serialize vote to JSON
  const voteJSON = JSON.stringify({
    candidateId: vote.candidateId,
    electionId: vote.electionId,
    timestamp: vote.timestamp,
    constituencyId: vote.constituencyId
  });

  // 2. Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3. Create cipher with AES-256-GCM
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBuffer(publicKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // 4. Encrypt with authentication
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    new TextEncoder().encode(voteJSON)
  );

  return {
    ciphertext: bufferToHex(encrypted),
    iv: bufferToHex(iv),
    algorithm: 'aes-256-gcm'
  };
}
```

## 📊 Data Models

### Core Data Structures

**Voter Model**:
```typescript
interface Voter {
  id: string;                    // UUID (internal DB only)
  voterHash: string;             // SHA256(nationalId + salt)
  constituencyId: string;        // Geographic constituency
  registeredAt: Date;
  hasVoted: boolean;             // Synced from blockchain
  voterAddress?: string;         // Ethereum address
}
```

**Vote Receipt Model**:
```typescript
interface VoteReceipt {
  receiptId: string;             // UUID (public identifier)
  voteId: string;                // Blockchain vote ID
  blockNumber: number;           // Block where vote was recorded
  transactionHash: string;       // Ethereum transaction hash
  timestamp: Date;
  constituencyId: string;
  zkProofHash: string;           // SHA256 of ZK proof
  verificationUrl: string;       // Public audit portal URL
}
```

**Election Model**:
```typescript
interface Election {
  id: string;                    // UUID
  blockchainId: string;          // bytes32 from ElectionManager
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'draft' | 'active' | 'ended' | 'finalized';
  candidates: Candidate[];
  constituencies: string[];
  allowRevoting: boolean;        // 30-minute window
  revotingWindowMinutes: number; // Default 30
}
```

## 🔍 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```typescript
// Request
{
  nationalId: string;      // 12-digit national ID
  password: string;        // Min 8 chars, mixed case, numbers
  constituencyId: string;  // UUID of constituency
  biometricData?: string;  // Simulated biometric hash
}

// Response
{
  success: boolean;
  voterHash: string;       // SHA256 hash for blockchain
  voterAddress: string;    // Ethereum address
  message: string;
}
```

**POST /api/auth/login**
```typescript
// Request
{
  nationalId: string;
  password: string;
  otp?: string;           // Simulated OTP
}

// Response
{
  success: boolean;
  token: string;          // JWT token (24h expiry)
  voterHash: string;
  constituencyId: string;
}
```

### Voting Endpoints

**GET /api/voter/status**
```typescript
// Headers: Authorization: Bearer <JWT>

// Response
{
  eligible: boolean;
  hasVoted: boolean;
  constituencyId: string;
  canRevote: boolean;     // Within 30-minute window
  revoteExpiresAt?: Date;
}
```

**POST /api/vote/token**
```typescript
// Headers: Authorization: Bearer <JWT>

// Response
{
  anonymousToken: string;  // UUID v4
  expiresAt: Date;        // 30 minutes from now
}
```

**POST /api/vote/cast**
```typescript
// Request
{
  anonymousToken: string;
  encryptedVote: EncryptedVote;
  zkProof: ZKProof;
}

// Response
{
  success: boolean;
  receipt: VoteReceipt;
  message: string;
}
```

### Audit Endpoints (Public)

**GET /api/audit/verify/:receiptId**
```typescript
// Response
{
  verified: boolean;
  voteId?: string;
  blockNumber?: number;
  transactionHash?: string;
  confirmations?: number;
  blockchainProof?: {
    blockHash: string;
    transactionIndex: number;
    encryptedVoteHash: string;
  };
  message: string;
}
```

**GET /api/audit/stats**
```typescript
// Response
{
  totalVotes: number;
  turnoutByConstituency: {
    [constituencyId: string]: {
      registered: number;
      voted: number;
      turnoutPercentage: number;
    };
  };
  recentVotes: Array<{
    timestamp: Date;
    constituencyId: string;
    blockNumber: number;
  }>;
}
```

## 🏛️ Smart Contract Interfaces

### VoterRegistry.sol (Chain 1)

```solidity
contract VoterRegistry {
    // Voter registration
    function registerVoter(
        bytes32 voterHash,
        string memory constituencyId
    ) external returns (address voterAddress);
    
    // Eligibility checks
    function isEligible(bytes32 voterHash) external view returns (bool);
    function hasVoted(bytes32 voterHash) external view returns (bool);
    
    // Vote marking
    function markVoted(bytes32 voterHash) external;
    
    // Events
    event VoterRegistered(
        bytes32 indexed voterHash,
        string constituencyId,
        uint256 timestamp
    );
    
    event VoterMarkedVoted(
        bytes32 indexed voterHash,
        uint256 timestamp
    );
}
```

### VoteLedger.sol (Chain 2)

```solidity
contract VoteLedger {
    // Vote submission
    function submitVote(
        bytes32 anonymousToken,
        string memory encryptedVote,
        string memory zkProof,
        string memory constituencyId
    ) external returns (bytes32 voteId);
    
    // Vote retrieval (for verification)
    function getVote(bytes32 voteId) external view returns (
        string memory encryptedVote,
        uint256 blockNumber,
        uint256 timestamp
    );
    
    // Tally functions
    function getConstituencyVoteCount(
        string memory constituencyId
    ) external view returns (uint256);
    
    // Events
    event VoteSubmitted(
        bytes32 indexed voteId,
        bytes32 indexed anonymousToken,
        string constituencyId,
        uint256 blockNumber,
        uint256 timestamp
    );
}
```

### ElectionManager.sol

```solidity
contract ElectionManager {
    // Election lifecycle
    function createElection(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        string[] memory candidateIds
    ) external returns (bytes32 electionId);
    
    function startElection(bytes32 electionId) external;
    function endElection(bytes32 electionId) external;
    
    // Results finalization
    function finalizeResults(
        bytes32 electionId,
        string[] memory candidateIds,
        uint256[] memory voteCounts
    ) external;
    
    // Events
    event ElectionCreated(
        bytes32 indexed electionId,
        string name,
        uint256 startTime
    );
    
    event ResultsFinalized(
        bytes32 indexed electionId,
        uint256 timestamp
    );
}
```

## 🧪 Testing & Development

### Running Tests

**Smart Contract Tests**:
```bash
cd apps/contracts
npm run test
```

**Backend API Tests**:
```bash
cd apps/backend
npm run test
```

**Mobile App Testing**:
```bash
cd apps/mobile
npm run test
```

### Development Scripts

**Blockchain Development**:
```bash
# Start local blockchain
npm run contracts:node

# Deploy contracts
npm run contracts:deploy

# Seed test data
npm run contracts:seed

# Run contract tests
npm run contracts:test
```

**Backend Development**:
```bash
# Start development server
npm run backend:dev

# Database operations
npm run backend:db:migrate
npm run backend:db:seed

# Build for production
npm run backend:build
```

**Mobile Development**:
```bash
# Start Expo development server
npm run mobile:start

# Run on specific platform
npm run mobile:android
npm run mobile:ios
npm run mobile:web
```

## 🚀 Deployment

### Production Considerations

**Blockchain Deployment**:
- Deploy to Ethereum testnet (Goerli/Sepolia) or mainnet
- Use proper gas optimization
- Implement contract upgradability patterns
- Set up monitoring and alerting

**Backend Deployment**:
- Use PostgreSQL instead of SQLite
- Implement horizontal scaling
- Set up load balancing
- Configure SSL/TLS certificates
- Use environment-specific configurations

**Mobile App Deployment**:
- Build for App Store and Google Play
- Implement code signing
- Set up crash reporting (Sentry)
- Configure push notifications
- Implement app updates mechanism

### Environment Variables

**Backend (.env)**:
```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:pass@host:5432/securevote"

# JWT Configuration
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=24h

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-key
VOTER_REGISTRY_ADDRESS=0x...
VOTE_LEDGER_ADDRESS=0x...
ELECTION_MANAGER_ADDRESS=0x...

# Crypto Configuration
SYSTEM_SALT=your-system-salt
ENCRYPTION_KEY=your-256-bit-encryption-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-audit-portal.com

# Security
BCRYPT_ROUNDS=12
```

## 🔒 Security Considerations

### Current Implementation (MVP)

**Simulated Components** (for hackathon demo):
- Zero-knowledge proofs (SHA256-based simulation)
- Homomorphic encryption (additive simulation)
- Biometric authentication (mock implementation)
- OTP verification (simulated)

**Production Security Requirements**:
- Replace ZK proof simulation with real zk-SNARKs (circom + snarkjs)
- Implement real homomorphic encryption (Paillier or ElGamal)
- Integrate real biometric authentication
- Use real OTP service (Twilio, AWS SNS)
- Deploy to secure cloud infrastructure
- Implement comprehensive security audits
- Add penetration testing
- Set up 24/7 monitoring

### Privacy Guarantees

**Voter Anonymity**:
- Two-chain architecture prevents vote-to-voter linking
- Anonymous tokens are cryptographically random
- Token mappings are purged immediately after voting
- No PII stored on blockchain

**Data Protection**:
- National IDs never stored in plaintext
- All PII hashed with secure salt
- Audit logs contain no personally identifiable information
- IP addresses hashed before storage

## 📈 Performance & Scalability

### Current Capacity

**MVP Targets**:
- 10,000 concurrent voters
- Vote submission < 5 seconds
- Blockchain confirmation < 30 seconds
- API response time < 500ms
- 99.9% uptime during election

### Scaling Strategies

**Horizontal Scaling**:
- Load balancer for API servers
- Database read replicas
- CDN for static assets
- Microservices architecture

**Blockchain Scaling**:
- Layer 2 solutions (Polygon, Arbitrum)
- State channels for high-frequency operations
- Batch processing for vote submissions
- Optimistic rollups for cost reduction

## 🎯 Demo Scenarios

### Scenario 1: Complete Voter Journey

1. **Registration**: New voter registers with national ID
2. **Login**: Voter logs in with credentials + OTP
3. **Eligibility Check**: System verifies voter can vote
4. **Vote Casting**: Voter selects candidate and submits encrypted vote
5. **Receipt Generation**: System provides QR code receipt
6. **Public Verification**: Anyone can verify the receipt on audit portal

### Scenario 2: Admin Election Management

1. **Election Setup**: Admin creates election with candidates
2. **Election Start**: Admin starts election at designated time
3. **Monitoring**: Real-time statistics during voting
4. **Election End**: Admin ends election
5. **Results Finalization**: Homomorphic tally computation
6. **Results Publication**: Final results published on blockchain

### Scenario 3: Public Transparency

1. **Receipt Verification**: Public verifies vote receipts
2. **Statistics Viewing**: Real-time turnout statistics
3. **Blockchain Exploration**: Inspect blocks and transactions
4. **Audit Trail**: Review system events and logs

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make changes and test thoroughly
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for code quality
- **Prettier**: Consistent code formatting
- **Testing**: Unit tests for critical functions
- **Documentation**: JSDoc comments for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Smart contract security patterns
- **Hardhat**: Ethereum development environment
- **Expo**: React Native development platform
- **Prisma**: Database toolkit and ORM
- **Socket.IO**: Real-time communication

## 📞 Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: securevote-support@example.com

---

**⚠️ Important Notice**: This is an MVP for hackathon demonstration. For production deployment, replace simulated cryptographic components with real implementations and conduct comprehensive security audits.

**🎉 Demo Ready**: The system is fully functional and ready for demonstration. All components are integrated and working together seamlessly.