# SecureVote - Setup Guide

This guide will help you set up the complete SecureVote blockchain e-voting system.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git**

## Installation Steps

### 1. Install Dependencies

From the root directory, install all dependencies for all workspaces:

```bash
npm install
```

This will install dependencies for:
- Root workspace (shared dev tools)
- `packages/shared-types` (TypeScript type definitions)
- `apps/contracts` (Smart contracts with Hardhat)
- `apps/backend` (Backend API)
- `apps/mobile` (React Native mobile app)
- `apps/audit-portal` (React audit portal)

### 2. Configure Environment Variables

Each application needs its own environment configuration:

#### Smart Contracts
```bash
cd apps/contracts
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

#### Backend API
```bash
cd apps/backend
cp .env.example .env
# Edit .env - you'll need to add contract addresses after deployment
```

#### Mobile App
```bash
cd apps/mobile
cp .env.example .env
# Edit .env if your backend runs on a different port
```

#### Audit Portal
```bash
cd apps/audit-portal
cp .env.example .env
# Edit .env if your backend runs on a different port
```

### 3. Build Shared Types

Build the shared types package that all applications depend on:

```bash
cd packages/shared-types
npm run build
```

### 4. Compile Smart Contracts

Compile the Solidity smart contracts:

```bash
cd apps/contracts
npm run compile
```

## Running the System

The system consists of multiple components that need to be run in separate terminals:

### Terminal 1: Local Blockchain

Start the Hardhat local blockchain node:

```bash
cd apps/contracts
npm run node
```

Keep this running. You'll see account addresses and private keys printed.

### Terminal 2: Deploy Contracts

Once the blockchain is running, deploy the smart contracts:

```bash
cd apps/contracts
npm run deploy
```

**Important**: Copy the deployed contract addresses from the output and update:
- `apps/contracts/.env`
- `apps/backend/.env`

### Terminal 3: Backend API

Start the backend API server:

```bash
cd apps/backend
npm run dev
```

The API will be available at `http://localhost:3000`

### Terminal 4: Mobile App

Start the Expo development server:

```bash
cd apps/mobile
npm start
```

Then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

### Terminal 5: Audit Portal

Start the audit portal web application:

```bash
cd apps/audit-portal
npm run dev
```

The portal will be available at `http://localhost:3001`

## Verification

To verify everything is working:

1. **Blockchain**: Check Terminal 1 for blockchain logs
2. **Backend**: Visit `http://localhost:3000` (should see API response)
3. **Mobile**: App should load in simulator/device
4. **Audit Portal**: Visit `http://localhost:3001` (should see the portal)

## Development Workflow

### Code Formatting

Format all code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Linting

Run ESLint on all workspaces:
```bash
npm run lint
```

### Building

Build all workspaces:
```bash
npm run build
```

### Testing

Run tests for smart contracts:
```bash
cd apps/contracts
npm test
```

Run tests for backend:
```bash
cd apps/backend
npm test
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

- Backend (3000): Change `PORT` in `apps/backend/.env`
- Audit Portal (3001): Change port in `apps/audit-portal/vite.config.ts`
- Blockchain (8545): Stop other Hardhat nodes or change port in `apps/contracts/hardhat.config.ts`

### Contract Deployment Fails

- Ensure the Hardhat node is running in Terminal 1
- Check that the RPC URL in `.env` matches the node URL
- Try restarting the Hardhat node

### Mobile App Won't Connect to Backend

- If using a physical device, ensure your computer and device are on the same network
- Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to use your computer's local IP instead of `localhost`
- Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

### Dependencies Installation Issues

If you encounter issues during `npm install`:

```bash
# Clean all node_modules
npm run clean

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

## Project Structure

```
securevote-blockchain-evoting/
├── apps/
│   ├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── backend/            # Node.js + Express API
│   ├── mobile/             # React Native + Expo mobile app
│   └── audit-portal/       # React web app for public audit
├── packages/
│   └── shared-types/       # Shared TypeScript types
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── tsconfig.json           # Root TypeScript configuration
├── package.json            # Root package.json with workspaces
└── README.md               # Project overview
```

## Next Steps

After completing the setup:

1. Review the requirements document: `.kiro/specs/securevote-blockchain-evoting-mvp/requirements.md`
2. Review the design document: `.kiro/specs/securevote-blockchain-evoting-mvp/design.md`
3. Check the task list: `.kiro/specs/securevote-blockchain-evoting-mvp/tasks.md`
4. Start implementing the next task in the sequence

## Support

For issues or questions:
- Check the README.md in each application directory
- Review the design document for architecture details
- Consult the requirements document for feature specifications
