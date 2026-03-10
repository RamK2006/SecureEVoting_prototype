# SecureVote Smart Contracts

Solidity smart contracts for the SecureVote blockchain voting system.

## 🚀 Quick Start

**New to deployment?** See [QUICK_START.md](./QUICK_START.md) for a 3-step guide.

**Need detailed docs?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment documentation.

### Quick Deploy (3 Commands)

```bash
# Terminal 1: Start blockchain
npm run node

# Terminal 2: Deploy everything
npm run deploy

# Export for backend
npm run export
```

## 📋 Contracts

- **VoterRegistry.sol**: Manages voter registration and eligibility (Chain 1)
- **VoteLedger.sol**: Stores encrypted votes with anonymous tokens (Chain 2)
- **ElectionManager.sol**: Handles election lifecycle and results finalization

## 🏗️ Architecture

The system uses a two-chain architecture:
- **Chain 1 (VoterRegistry)**: Links voter identity to eligibility and voting status
- **Chain 2 (VoteLedger)**: Stores encrypted votes with anonymous tokens

This separation ensures voter anonymity while maintaining election integrity.

## 🛠️ Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile contracts:
   ```bash
   npm run compile
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Start local Hardhat node:
   ```bash
   npm run node
   ```

5. Deploy contracts (in another terminal):
   ```bash
   npm run deploy
   ```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run node` | Start local Hardhat blockchain |
| `npm run deploy` | Deploy all contracts with test data |
| `npm run deploy:voter-registry` | Deploy VoterRegistry only |
| `npm run deploy:vote-ledger` | Deploy VoteLedger only |
| `npm run deploy:election-manager` | Deploy ElectionManager only |
| `npm run seed` | Seed additional test data |
| `npm run export` | Export contracts for backend |
| `npm run console` | Open Hardhat console |
| `npm run compile` | Compile contracts |
| `npm test` | Run contract tests |

## 📁 Generated Files

After deployment:

```
deployments/
├── deployment-1337.json          # Deployment metadata
└── abis/                         # Contract ABIs

exports/
├── contracts.json                # JSON export
├── contracts.ts                  # TypeScript module
├── contracts-backend.ts          # Backend config
└── abis/                         # ABI files
```

## 🔗 Backend Integration

```typescript
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../contracts/exports/contracts-backend';
import { Web3 } from 'web3';

const web3 = new Web3('http://127.0.0.1:8545');
const voterRegistry = new web3.eth.Contract(
  CONTRACT_ABIS.VOTER_REGISTRY,
  CONTRACT_ADDRESSES.VOTER_REGISTRY
);
```

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment documentation
- [docs/](./docs/) - Individual contract documentation

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Test coverage includes:
- Voter registration and eligibility checks
- Vote submission and retrieval
- Election lifecycle management
- Access control and security

## 🔐 Security

- Admin-only functions protected by `onlyAdmin` modifier
- Time-based validations for election lifecycle
- One-person-one-vote enforcement
- Anonymous vote storage with encrypted data

## 📄 License

MIT
