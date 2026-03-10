# SecureVote Backend API

Node.js + Express backend API for the SecureVote blockchain voting system.

## Features

- **Express Server**: RESTful API with TypeScript
- **Security Middleware**:
  - Helmet for security headers (CSP, HSTS, etc.)
  - CORS configuration with allowed origins
  - Multi-tier rate limiting (global, vote-specific, auth-specific)
  - JWT authentication with bcrypt password hashing
- **Logging**: Winston logger with file and console transports
- **Error Handling**: Centralized error handling with custom error classes
- **Real-time Updates**: Socket.IO for live election statistics
- **Request Logging**: Privacy-preserving logging with IP hashing
- **Web3 Integration**: Blockchain interaction for voter registry and vote ledger
- **Database**: SQLite for development, PostgreSQL-ready for production

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with required configuration:
   - `JWT_SECRET`: Secret key for JWT tokens (required in production)
   - `SYSTEM_SALT`: Salt for hashing voter identities (required in production)
   - `ENCRYPTION_KEY`: 32-byte hex key for encryption (required in production)
   - `BLOCKCHAIN_RPC_URL`: Hardhat node URL (default: http://127.0.0.1:8545)
   - Contract addresses (after deployment)

4. Start development server:
   ```bash
   npm run dev
   ```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Production

Build and start:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status and uptime

### API Info
- `GET /api` - API version and operational status

### Authentication
- `POST /api/auth/register` - Register new voter
- `POST /api/auth/login` - Login with credentials

### Voting
- `GET /api/voter/status` - Check voter eligibility
- `GET /api/election/current` - Get active election
- `POST /api/vote/token` - Generate anonymous voting token
- `POST /api/vote/cast` - Submit encrypted vote

### Audit (Public)
- `GET /api/audit/verify/:receiptId` - Verify vote receipt
- `GET /api/audit/stats` - Get real-time election statistics

### Admin
- `POST /api/admin/election/create` - Create new election
- `POST /api/admin/election/:id/start` - Start election
- `POST /api/admin/election/:id/end` - End election
- `POST /api/admin/election/:id/finalize` - Finalize results

## Middleware

### Security
- **Helmet**: Sets security headers
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options, X-Content-Type-Options, etc.
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 
  - Global: 100 requests per 15 minutes
  - Vote casting: 5 requests per minute
  - Authentication: 10 requests per 15 minutes (skip successful requests)
  - Admin operations: 50 requests per 15 minutes

### Logging
- Request/response logging with Winston
- IP address hashing for privacy compliance
- Separate error and combined log files in production
- Configurable log levels (info, warn, error)
- Log rotation (5MB max, 5 files retained)

### Error Handling
- Centralized error handler middleware
- Custom error classes:
  - `AppError`: Base error class
  - `NotFoundError`: 404 errors
  - `UnauthorizedError`: 401 errors
  - `ForbiddenError`: 403 errors
  - `BadRequestError`: 400 errors
  - `ConflictError`: 409 errors
  - `ServiceUnavailableError`: 503 errors
- Stack traces only in development
- Comprehensive error logging

## Socket.IO

Real-time updates for:
- Vote casting events
- Election statistics
- Turnout updates by constituency

### Events
- `connection`: Client connects to Socket.IO
- `subscribe`: Subscribe to election-specific updates
  ```javascript
  socket.emit('subscribe', { electionId: 'election-id' });
  ```
- `disconnect`: Client disconnects

### Server-emitted Events
- `vote_cast`: New vote submitted
- `stats_update`: Election statistics updated

## Configuration

All configuration is managed through environment variables and the `config/env.ts` file:

- **Server**: Port, environment (development/production)
- **Database**: Connection URL
- **JWT**: Secret, expiration time
- **Blockchain**: RPC URL, contract addresses
- **Rate Limiting**: Window duration, max requests
- **CORS**: Allowed origins
- **Security**: Bcrypt rounds, token TTL, re-voting window
- **Logging**: Log level

Configuration validation runs on startup and will exit if required variables are missing in production.

## Logging

Winston logger with:
- **Console output**: Colorized in development, JSON in production
- **File output** (production only):
  - `logs/error.log`: Error-level logs only
  - `logs/combined.log`: All logs
- **Log rotation**: 5MB max file size, 5 files retained
- **Privacy**: IP addresses hashed before logging

## Architecture

```
src/
├── config/
│   ├── env.ts          # Environment configuration
│   └── logger.ts       # Winston logger setup
├── middleware/
│   ├── errorHandler.ts # Error handling middleware
│   ├── rateLimiter.ts  # Rate limiting configurations
│   └── requestLogger.ts # Request logging middleware
├── controllers/     # Request handlers (to be implemented)
├── services/        # Business logic (to be implemented)
├── models/          # Data models (to be implemented)
├── routes/          # API routes (to be implemented)
├── utils/           # Utilities (to be implemented)
└── index.ts         # Main server entry point
```

## Security Features

1. **Helmet**: Comprehensive security headers
2. **CORS**: Restricted to configured origins only
3. **Rate Limiting**: Multi-tier protection against abuse
4. **Request Logging**: IP addresses hashed for privacy
5. **Error Handling**: No sensitive data exposed in error responses
6. **Environment Validation**: Required variables checked on startup
7. **Graceful Shutdown**: SIGTERM/SIGINT handlers for clean shutdown

## Scripts

- `npm run dev`: Start development server with hot reload (ts-node-dev)
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run tests (Jest)
- `npm run test:watch`: Run tests in watch mode

## Next Steps

Additional components to be implemented in subsequent tasks:
- Authentication routes and JWT middleware
- Voter registration and eligibility endpoints
- Vote casting endpoints with blockchain integration
- Admin election management endpoints
- Audit and verification endpoints
- Database models and migrations
- Blockchain service for Web3 interactions
- Crypto service for encryption and ZK proofs
- Comprehensive test suite

