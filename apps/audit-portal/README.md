# SecureVote Audit Portal

Public-facing React web application for vote verification and election transparency.

## Features

- Public access (no authentication required)
- Vote receipt verification
- Real-time election statistics
- Blockchain proof display
- QR code scanning
- Constituency-level turnout visualization
- Recent vote activity feed

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Pages

- **Home**: Overview and navigation
- **Verify**: Receipt verification interface
- **Statistics**: Real-time election statistics dashboard
- **Explorer**: Blockchain explorer for vote records

## Architecture

```
src/
├── components/      # React components
├── pages/           # Page components
├── services/        # API services
├── hooks/           # Custom React hooks
├── utils/           # Utilities
└── main.tsx         # Entry point
```
