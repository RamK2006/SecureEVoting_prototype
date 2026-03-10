# SecureVote Contracts - Quick Start Guide

## 🚀 Quick Deployment (3 Steps)

### Step 1: Start Hardhat Node

```bash
cd apps/contracts
npm run node
```

Keep this terminal running. You'll see 20 test accounts with addresses and private keys.

### Step 2: Deploy All Contracts (New Terminal)

```bash
cd apps/contracts
npm run deploy
```

This will:
- ✅ Deploy VoterRegistry, VoteLedger, and ElectionManager
- ✅ Create 5 constituencies (const-001 to const-005)
- ✅ Register 10 test voters
- ✅ Create a test election with 6 candidates
- ✅ Export contract addresses and ABIs

**Output:** Contract addresses will be saved to `deployments/deployment-1337.json`

### Step 3: Export for Backend

```bash
npm run export
```

This creates backend-ready files in `exports/` directory.

## 📁 Generated Files

After deployment, you'll have:

```
apps/contracts/
├── deployments/
│   ├── deployment-1337.json          # Full deployment metadata
│   └── abis/
│       ├── VoterRegistry.json
│       ├── VoteLedger.json
│       └── ElectionManager.json
└── exports/
    ├── contracts.json                # JSON export for any use
    ├── contracts.ts                  # TypeScript module
    ├── contracts-backend.ts          # Backend-friendly config
    └── abis/                         # ABI files
```

## 🔧 Available Commands

```bash
# Start local blockchain
npm run node

# Deploy all contracts
npm run deploy

# Deploy individual contracts
npm run deploy:voter-registry
npm run deploy:vote-ledger
npm run deploy:election-manager

# Seed additional test data
npm run seed

# Export contracts for backend
npm run export

# Open Hardhat console
npm run console

# Compile contracts
npm run compile

# Run tests
npm run test
```

## 💻 Using in Backend

### Option 1: Import TypeScript Module

```typescript
import CONTRACTS from '../contracts/exports/contracts';

const web3 = new Web3('http://127.0.0.1:8545');

const voterRegistry = new web3.eth.Contract(
  CONTRACTS.VoterRegistry.abi,
  CONTRACTS.VoterRegistry.address
);
```

### Option 2: Import Backend Config

```typescript
import { 
  CONTRACT_ADDRESSES, 
  CONTRACT_ABIS, 
  BLOCKCHAIN_CONFIG 
} from '../contracts/exports/contracts-backend';

const web3 = new Web3(BLOCKCHAIN_CONFIG.RPC_URL);

const voterRegistry = new web3.eth.Contract(
  CONTRACT_ABIS.VOTER_REGISTRY,
  CONTRACT_ADDRESSES.VOTER_REGISTRY
);
```

## 📊 Test Data

### Constituencies
- `const-001` through `const-005` (5 districts)

### Test Voters
- 10 voters registered during deployment
- Distributed evenly across constituencies
- Voter hashes are generated using `keccak256(nationalId)`

### Test Election
- **Name:** Test General Election 2024
- **Duration:** 24 hours
- **Candidates:** 6 candidates across 3 constituencies
  - Alice Johnson (Progressive Party) - const-001
  - Bob Smith (Conservative Alliance) - const-001
  - Carol Davis (Independent) - const-002
  - David Lee (Green Party) - const-002
  - Emma Wilson (Labor Union) - const-003
  - Frank Miller (Progressive Party) - const-003

## 🔍 Verify Deployment

### Check Contract Addresses

```bash
cat deployments/deployment-1337.json
```

### Query Contract State

```bash
npm run console

# In console:
const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
const voterRegistry = await VoterRegistry.attach("0x5FbDB...");
const total = await voterRegistry.getTotalRegistered();
console.log("Total voters:", total.toString());
```

## 🐛 Troubleshooting

### "Deployment file not found"
**Solution:** Run `npm run deploy` first

### "Connection refused" to localhost:8545
**Solution:** Start Hardhat node with `npm run node`

### "Nonce too high" error
**Solution:** Restart Hardhat node and redeploy

### Contract addresses changed
**Solution:** Hardhat node resets on restart. Redeploy and re-export.

## 📚 Full Documentation

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎯 Next Steps

1. ✅ Deploy contracts (you're here!)
2. 🔧 Integrate with backend API
3. 📱 Configure mobile app
4. 🌐 Set up audit portal
5. 🧪 Run end-to-end tests

## 📞 Support

For issues or questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed docs
- Review contract documentation in `docs/` directory
- Check the spec: `.kiro/specs/securevote-blockchain-evoting-mvp/`
