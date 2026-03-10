# SecureVote Mobile App

React Native + Expo mobile application for voters.

## Features

- Cross-platform (iOS and Android)
- Biometric authentication (simulated)
- Client-side vote encryption
- QR code generation and scanning
- Haptic feedback
- Real-time election statistics
- Secure token storage

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start Expo development server:
   ```bash
   npm start
   ```

4. Run on device/simulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Screens

- **Register**: Voter registration with national ID
- **Login**: Authentication with OTP simulation
- **Dashboard**: Voter status and active elections
- **Vote**: 5-step voting flow with encryption
- **Receipt**: Vote receipt with QR code
- **Verify**: Public receipt verification
- **Admin Dashboard**: Election management (admin only)

## Architecture

```
src/
├── screens/         # Screen components
├── components/      # Reusable components
├── services/        # API and crypto services
├── navigation/      # Navigation configuration
├── hooks/           # Custom React hooks
├── utils/           # Utilities
└── types/           # TypeScript types
```
