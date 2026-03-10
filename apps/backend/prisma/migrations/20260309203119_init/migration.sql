-- CreateTable
CREATE TABLE "voters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voterHash" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "voterAddress" TEXT
);

-- CreateTable
CREATE TABLE "auth_credentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voterHash" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpSecret" TEXT,
    "lastLogin" DATETIME,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    CONSTRAINT "auth_credentials_voterHash_fkey" FOREIGN KEY ("voterHash") REFERENCES "voters" ("voterHash") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "voting_tokens" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "voterHash" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "voting_tokens_voterHash_fkey" FOREIGN KEY ("voterHash") REFERENCES "voters" ("voterHash") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "voting_tokens_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vote_receipts" (
    "receiptId" TEXT NOT NULL PRIMARY KEY,
    "voteId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "constituencyId" TEXT NOT NULL,
    "zkProofHash" TEXT NOT NULL,
    "verificationUrl" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    CONSTRAINT "vote_receipts_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "elections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockchainId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "allowRevoting" BOOLEAN NOT NULL DEFAULT true,
    "revotingWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "manifesto" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "candidates_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "actorHash" TEXT,
    "resourceId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL DEFAULT 'info'
);

-- CreateIndex
CREATE UNIQUE INDEX "voters_voterHash_key" ON "voters"("voterHash");

-- CreateIndex
CREATE INDEX "voters_voterHash_idx" ON "voters"("voterHash");

-- CreateIndex
CREATE INDEX "voters_constituencyId_idx" ON "voters"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_credentials_voterHash_key" ON "auth_credentials"("voterHash");

-- CreateIndex
CREATE INDEX "auth_credentials_voterHash_idx" ON "auth_credentials"("voterHash");

-- CreateIndex
CREATE INDEX "voting_tokens_voterHash_idx" ON "voting_tokens"("voterHash");

-- CreateIndex
CREATE INDEX "voting_tokens_electionId_idx" ON "voting_tokens"("electionId");

-- CreateIndex
CREATE INDEX "voting_tokens_expiresAt_idx" ON "voting_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "vote_receipts_voteId_key" ON "vote_receipts"("voteId");

-- CreateIndex
CREATE INDEX "vote_receipts_voteId_idx" ON "vote_receipts"("voteId");

-- CreateIndex
CREATE INDEX "vote_receipts_electionId_idx" ON "vote_receipts"("electionId");

-- CreateIndex
CREATE INDEX "vote_receipts_constituencyId_idx" ON "vote_receipts"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "elections_blockchainId_key" ON "elections"("blockchainId");

-- CreateIndex
CREATE INDEX "elections_blockchainId_idx" ON "elections"("blockchainId");

-- CreateIndex
CREATE INDEX "elections_status_idx" ON "elections"("status");

-- CreateIndex
CREATE INDEX "elections_startTime_idx" ON "elections"("startTime");

-- CreateIndex
CREATE INDEX "elections_endTime_idx" ON "elections"("endTime");

-- CreateIndex
CREATE INDEX "candidates_electionId_idx" ON "candidates"("electionId");

-- CreateIndex
CREATE INDEX "candidates_constituencyId_idx" ON "candidates"("constituencyId");

-- CreateIndex
CREATE INDEX "audit_logs_eventType_idx" ON "audit_logs"("eventType");

-- CreateIndex
CREATE INDEX "audit_logs_actorHash_idx" ON "audit_logs"("actorHash");

-- CreateIndex
CREATE INDEX "audit_logs_resourceId_idx" ON "audit_logs"("resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");
