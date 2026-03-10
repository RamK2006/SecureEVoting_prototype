# SecureVote Smart Contracts - Deployment Guide

This guide covers the deployment and configuration of the SecureVote blockchain e-voting system smart contracts.

## Overview

The SecureVote system consists of three main smart contracts:

1. **VoterRegistry** (Chain 1) - Manages voter identity and eligibility
2. **VoteLedger** (Chain 2) - Stores anonymous encrypted votes
3. **ElectionManager** - Handles election lifecycle and results

## Prerequisites

- Node.js 18+ installed
- Hardhat configured (see `hardhat.config.ts`)
- Local Hardhat node running (for local deployment)

## Quick Start

### 1. Start Local Hardhat Node

In one terminal, start the local blockchain:

```bash
cd apps/contracts
npx hardhat node
```

This will:
- Start a local Ethereum node on `http://127.0.0.1:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys
- Keep the node running for development

### 2. Deploy All Contracts

In another terminal, run the comprehensive deployment script:

```bash
npx hardhat run scripts/deploy-all.ts --network localhost
```

This script will:
- Deploy VoterRegistry, VoteLedger, and ElectionManager contracts
- Add 5 initial constituencies (const-001 through const-005)
- Register 10 test voters with hashed identities
- Create and start a test election with 5 candidates
- Export contract addresses and ABIs to `deployments/` directory

**Output:**
```
SecureVote Blockchain E-Voting System - Full Deployment
============================================================

Network: localhost
Chain ID: 1337

PHASE 1: Deploying VoterRegistry (Chain 1 - Identity & Eligibility)
------------------------------------------------------------
✓ VoterRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

PHASE 2: Deploying VoteLedger (Chain 2 - Anonymous Votes)
------------------------------------------------------------
✓ VoteLedger deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

PHASE 3: Deploying ElectionManager (Lifecycle & Results)
------------------------------------------------------------
✓ ElectionManager deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

...
```

### 3. Seed Additional Test Data (Optional)

To add more test voters and sample votes:

```bash
npx hardhat run scripts/seed-data.ts --network localhost
```

This will:
- Register 20 additional test voters
- Submit 5 sample encrypted votes
- Display statistics for each constituency

### 4. Export Contracts for Backend

Generate contract addresses and ABIs for backend integration:

```bash
npx hardhat run scripts/export-contracts.ts --network localhost
```

This creates:
- `exports/contracts.json` - Full contract data in JSON format
- `exports/contracts.ts` - TypeScript module with addresses and ABIs
- `exports/contracts-backend.ts` - Backend-friendly configuration
- `exports/abis/` - Individual ABI JSON files

## Deployment Scripts

### deploy-all.ts

**Purpose:** Comprehensive deployment of all contracts with initial data seeding.

**Features:**
- Deploys all three contracts in correct order
- Configures 5 constituencies
- Registers 10 test voters
- Creates and starts a test election
- Exports deployment info and ABIs

**Usage:**
```bash
npx hardhat run scripts/deploy-all.ts --network <network>
```

**Output Files:**
- `deployments/deployment-<chainId>.json` - Deployment metadata
- `deployments/abis/*.json` - Contract ABIs

### seed-data.ts

**Purpose:** Add additional test data to deployed contracts.

**Features:**
- Registers 20 more test voters
- Submits sample encrypted votes
- Displays constituency statistics

**Usage:**
```bash
npx hardhat run scripts/seed-data.ts --network <network>
```

**Prerequisites:** Must run `deploy-all.ts` first.

### export-contracts.ts

**Purpose:** Export contract addresses and ABIs for backend integration.

**Features:**
- Generates TypeScript and JSON exports
- Creates backend-friendly configuration
- Copies ABIs to export directory

**Usage:**
```bash
npx hardhat run scripts/export-contracts.ts --network <network>
```

**Output Files:**
- `exports/contracts.json`
- `exports/contracts.ts`
- `exports/contracts-backend.ts`
- `exports/abis/*.json`

### Individual Deployment Scripts

For deploying contracts individually:

```bash
# Deploy VoterRegistry only
npx hardhat run scripts/deploy-voter-registry.ts --network localhost

# Deploy VoteLedger only
npx hardhat run scripts/deploy-vote-ledger.ts --network localhost

# Deploy ElectionManager only
npx hardhat run scripts/deploy-election-manager.ts --network localhost
```

## Network Configuration

### Local Development (Hardhat Node)

```typescript
// hardhat.config.ts
networks: {
  hardhat: {
    chainId: 1337,
    mining: {
      auto: true,
      interval: 0,
    },
  },
  localhost: {
    url: 'http://127.0.0.1:8545',
    chainId: 1337,
  },
}
```

**Test Accounts:**
The Hardhat node provides 20 pre-funded accounts. The first account is used as the deployer and admin.

### Production Networks (Future)

For testnet/mainnet deployment, add network configuration:

```typescript
// hardhat.config.ts
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 11155111,
  },
  mainnet: {
    url: process.env.MAINNET_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 1,
  },
}
```

## Deployment Artifacts

### Directory Structure

```
apps/contracts/
├── deployments/
│   ├── deployment-1337.json      # Deployment metadata
│   └── abis/
│       ├── VoterRegistry.json
│       ├── VoteLedger.json
│       └── ElectionManager.json
├── exports/
│   ├── contracts.json             # Full contract export
│   ├── contracts.ts               # TypeScript module
│   ├── contracts-backend.ts       # Backend config
│   └── abis/
│       ├── VoterRegistry.json
│       ├── VoteLedger.json
│       └── ElectionManager.json
└── artifacts/                     # Hardhat compilation artifacts
```

### Deployment Metadata Format

```json
{
  "network": "localhost",
  "chainId": 1337,
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "contracts": {
    "voterRegistry": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "voteLedger": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "electionManager": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  },
  "constituencies": ["const-001", "const-002", "const-003", "const-004", "const-005"],
  "testVoters": [...],
  "testElection": {
    "electionId": "0x...",
    "name": "Test General Election 2024",
    "candidates": [...]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Backend Integration

### Using Exported Contracts

```typescript
// In your backend (Node.js + Express)
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, BLOCKCHAIN_CONFIG } from '../contracts/exports/contracts-backend';
import { Web3 } from 'web3';

// Initialize Web3
const web3 = new Web3(BLOCKCHAIN_CONFIG.RPC_URL);

// Connect to contracts
const voterRegistry = new web3.eth.Contract(
  CONTRACT_ABIS.VOTER_REGISTRY,
  CONTRACT_ADDRESSES.VOTER_REGISTRY
);

const voteLedger = new web3.eth.Contract(
  CONTRACT_ABIS.VOTE_LEDGER,
  CONTRACT_ADDRESSES.VOTE_LEDGER
);

const electionManager = new web3.eth.Contract(
  CONTRACT_ABIS.ELECTION_MANAGER,
  CONTRACT_ADDRESSES.ELECTION_MANAGER
);

// Example: Register a voter
async function registerVoter(voterHash: string, constituencyId: string) {
  const accounts = await web3.eth.getAccounts();
  const tx = await voterRegistry.methods
    .registerVoter(voterHash, constituencyId)
    .send({ from: accounts[0] });
  
  return tx;
}

// Example: Check if voter has voted
async function hasVoted(voterHash: string): Promise<boolean> {
  return await voterRegistry.methods.hasVoted(voterHash).call();
}

// Example: Submit a vote
async function submitVote(
  anonymousToken: string,
  encryptedVote: string,
  zkProof: string,
  constituencyId: string
) {
  const accounts = await web3.eth.getAccounts();
  const tx = await voteLedger.methods
    .submitVote(anonymousToken, encryptedVote, zkProof, constituencyId)
    .send({ from: accounts[0] });
  
  return tx;
}
```

## Test Data

### Default Constituencies

The deployment creates 5 constituencies:
- `const-001` - District 1
- `const-002` - District 2
- `const-003` - District 3
- `const-004` - District 4
- `const-005` - District 5

### Test Voters

- 10 voters registered during deployment
- 20 additional voters via seed script
- Voter hashes are generated using `keccak256(nationalId)`
- Distributed evenly across constituencies

### Test Election

**Name:** Test General Election 2024

**Candidates:**
- `candidate-001` - Alice Johnson (Progressive Party)
- `candidate-002` - Bob Smith (Conservative Alliance)
- `candidate-003` - Carol Davis (Independent)
- `candidate-004` - David Lee (Green Party)
- `candidate-005` - Emma Wilson (Labor Union)

**Duration:** 24 hours from deployment

**Status:** Started immediately after creation

## Verification

### Verify Deployment

```bash
# Check contract addresses
npx hardhat run scripts/verify-deployment.ts --network localhost
```

### Query Contract State

```bash
# Using Hardhat console
npx hardhat console --network localhost

# In console:
const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
const voterRegistry = await VoterRegistry.attach("0x5FbDB...");
const totalRegistered = await voterRegistry.getTotalRegistered();
console.log("Total registered voters:", totalRegistered.toString());
```

### View Blockchain Explorer

For local development, you can use:
- Hardhat console for queries
- Etherscan-like explorers (if configured)
- Custom audit portal (part of SecureVote system)

## Troubleshooting

### Issue: "Deployment file not found"

**Solution:** Run `deploy-all.ts` before running other scripts:
```bash
npx hardhat run scripts/deploy-all.ts --network localhost
```

### Issue: "Connection refused" to localhost:8545

**Solution:** Ensure Hardhat node is running:
```bash
npx hardhat node
```

### Issue: "Nonce too high" error

**Solution:** Reset Hardhat node and redeploy:
1. Stop the Hardhat node (Ctrl+C)
2. Restart: `npx hardhat node`
3. Redeploy: `npx hardhat run scripts/deploy-all.ts --network localhost`

### Issue: Contract addresses changed after restart

**Solution:** Hardhat node resets on restart. You must:
1. Redeploy contracts
2. Re-export contract addresses
3. Update backend configuration

## Security Considerations

### Private Keys

- **Never commit private keys** to version control
- Use environment variables for production deployments
- Hardhat test accounts are for development only

### Admin Access

- The deployer account becomes the admin for all contracts
- Admin can add constituencies, create elections, and finalize results
- In production, use multi-sig wallets for admin functions

### Gas Optimization

- Contracts are optimized with Solidity optimizer (200 runs)
- Batch operations where possible to save gas
- Monitor gas usage in production

## NPM Scripts

Add these to `package.json` for convenience:

```json
{
  "scripts": {
    "node": "hardhat node",
    "deploy": "hardhat run scripts/deploy-all.ts --network localhost",
    "deploy:voter-registry": "hardhat run scripts/deploy-voter-registry.ts --network localhost",
    "deploy:vote-ledger": "hardhat run scripts/deploy-vote-ledger.ts --network localhost",
    "deploy:election-manager": "hardhat run scripts/deploy-election-manager.ts --network localhost",
    "seed": "hardhat run scripts/seed-data.ts --network localhost",
    "export": "hardhat run scripts/export-contracts.ts --network localhost",
    "console": "hardhat console --network localhost"
  }
}
```

## Next Steps

After deployment:

1. **Backend Integration:** Use exported contracts in your Node.js backend
2. **Mobile App:** Configure mobile app with contract addresses
3. **Audit Portal:** Set up public audit portal with blockchain connection
4. **Testing:** Run end-to-end tests with deployed contracts
5. **Monitoring:** Set up event listeners for contract events

## References

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- SecureVote Design Document: `.kiro/specs/securevote-blockchain-evoting-mvp/design.md`
- SecureVote Requirements: `.kiro/specs/securevote-blockchain-evoting-mvp/requirements.md`
