# SecureVote - Blockchain-Based Electronic Voting System MVP

A production-ready MVP demonstrating a blockchain-based electronic voting system with two-chain architecture for voter anonymity, end-to-end encryption, and real-time transparency.

## Architecture

This monorepo contains four main applications:

- **Smart Contracts** (`apps/contracts`): Solidity smart contracts for voter registration, vote storage, and election management
- **Backend API** (`apps/backend`): Node.js + Express API with JWT authentication and blockchain integration
- **Mobile App** (`apps/mobile`): React Native + Expo mobile application for voters
- **Audit Portal** (`apps/audit-portal`): React web application for public vote verification

## Prerequisites

- Node.js 18+ and npm 9+
- Git

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start local blockchain**
   ```bash
   npm run contracts:compile
   cd apps/contracts
   npx hardhat node
   ```

3. **Deploy contracts** (in a new terminal)
   ```bash
   npm run contracts:deploy
   ```

4. **Start backend API** (in a new terminal)
   ```bash
   npm run backend:dev
   ```

5. **Start mobile app** (in a new terminal)
   ```bash
   npm run mobile:start
   ```

6. **Start audit portal** (in a new terminal)
   ```bash
   npm run audit-portal:dev
   ```

## Project Structure

```
securevote-blockchain-evoting/
├── apps/
│   ├── contracts/          # Smart contracts (Hardhat + Solidity)
│   ├── backend/            # Backend API (Node.js + Express)
│   ├── mobile/             # Mobile app (React Native + Expo)
│   └── audit-portal/       # Audit portal (React)
├── packages/
│   └── shared-types/       # Shared TypeScript types
├── package.json            # Root package.json with workspaces
└── README.md
```

## Key Features

- **Two-Chain Architecture**: Separates voter identity (Chain 1) from vote records (Chain 2)
- **End-to-End Encryption**: AES-256-GCM client-side vote encryption
- **Zero-Knowledge Proofs**: SHA256-based simulation for vote validity
- **Anonymous Voting**: Single-use tokens decouple identity from votes
- **Real-Time Transparency**: Socket.IO for live election statistics
- **Public Verification**: Anyone can verify vote receipts on audit portal
- **Coercion Resistance**: 30-minute re-voting window

## Security Considerations

This is an MVP for hackathon demonstration. For production deployment:

- Replace ZK proof simulation with real zk-SNARKs (circom + snarkjs)
- Implement real homomorphic encryption (Paillier/ElGamal)
- Deploy to Ethereum testnet/mainnet
- Integrate real biometric authentication
- Add comprehensive security audits

## License

MIT
