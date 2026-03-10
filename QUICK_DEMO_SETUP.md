# SecureVote - Quick Demo Setup

This guide will get your SecureVote system running quickly for demo purposes.

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Setup (5 minutes)

### 1. Install All Dependencies

```bash
npm install
```

### 2. Setup Environment Files

```bash
# Backend
cd apps/backend
cp .env.example .env
cd ../..

# Contracts
cd apps/contracts
cp .env.example .env
cd ../..
```

### 3. Build Shared Types

```bash
cd packages/shared-types
npm run build
cd ../..
```

### 4. Compile and Deploy Contracts

```bash
cd apps/contracts
npm run compile
npm run node &  # Start blockchain in background
sleep 5  # Wait for blockchain to start
npm run deploy
cd ../..
```

### 5. Setup Database

```bash
cd apps/backend
npm run db:generate
npm run db:push
npm run db:seed
cd ../..
```

### 6. Start All Services

Open 3 terminals:

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Mobile App:**
```bash
cd apps/mobile
npm start
```

**Terminal 3 - Audit Portal:**
```bash
cd apps/audit-portal
npm run dev
```

## Demo Flow

1. **Mobile App**: Register a new voter
2. **Mobile App**: Login with credentials
3. **Mobile App**: Cast a vote
4. **Mobile App**: View receipt
5. **Audit Portal**: Verify receipt
6. **Audit Portal**: View real-time statistics

## Test Credentials

After running the setup, you can use these test voters:

- National ID: `123456789012`
- Password: `password123`
- Constituency: `const-001`

## URLs

- Backend API: http://localhost:3000
- Audit Portal: http://localhost:3001
- Mobile App: Expo development server (scan QR code)

## Troubleshooting

If something doesn't work:

1. Make sure all terminals are running
2. Check that ports 3000, 3001, and 8545 are free
3. Restart the blockchain node if contracts fail to deploy
4. Check the console logs for specific errors

## Demo Script

1. Show the mobile app registration flow
2. Demonstrate the voting process
3. Show the receipt generation
4. Verify the vote on the audit portal
5. Display real-time statistics
6. Explain the blockchain architecture

The system is now ready for your demo video!