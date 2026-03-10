import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cryptoService from '../services/crypto.service';
import blockchainService from '../services/blockchain.service';
import { AuthRequest } from '../middleware/auth';
import { BadRequestError, ForbiddenError, ConflictError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getVoterStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const voterHash = req.voterHash!;

  // Get voter from database
  const voter = await prisma.voter.findUnique({
    where: { voterHash }
  });

  if (!voter) {
    throw new BadRequestError('Voter not found');
  }

  // Check blockchain eligibility
  const isEligible = await blockchainService.isEligible(voterHash);
  const hasVoted = await blockchainService.hasVoted(voterHash);

  res.json({
    voterHash: voter.voterHash,
    constituencyId: voter.constituencyId,
    isEligible,
    hasVoted,
    registeredAt: voter.registeredAt
  });
});

export const getCurrentElection = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Get active election from blockchain
  const activeElectionId = await blockchainService.getActiveElection();
  
  if (!activeElectionId || activeElectionId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return res.json({ message: 'No active election' });
  }

  // Get election details
  const electionStatus = await blockchainService.getElectionStatus(activeElectionId);
  const candidateIds = await blockchainService.getCandidates(activeElectionId);

  // Get candidate details
  const candidates = [];
  for (const candidateId of candidateIds) {
    const candidate = await blockchainService.getCandidate(activeElectionId, candidateId);
    candidates.push({
      id: candidateId,
      name: candidate[0],
      party: candidate[1],
      constituencyId: candidate[2]
    });
  }

  res.json({
    electionId: activeElectionId,
    name: electionStatus[0],
    description: electionStatus[1],
    startTime: new Date(Number(electionStatus[2]) * 1000),
    endTime: new Date(Number(electionStatus[3]) * 1000),
    isActive: electionStatus[5],
    candidates
  });
});

export const generateVotingToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const voterHash = req.voterHash!;
  const { electionId } = req.body;

  if (!electionId) {
    throw new BadRequestError('Election ID is required');
  }

  // Check if voter is eligible
  const isEligible = await blockchainService.isEligible(voterHash);
  if (!isEligible) {
    throw new ForbiddenError('Voter not eligible or already voted');
  }

  // Get voter details
  const voter = await prisma.voter.findUnique({
    where: { voterHash }
  });

  if (!voter) {
    throw new BadRequestError('Voter not found');
  }

  // Check for existing active token
  const existingToken = await prisma.votingToken.findFirst({
    where: {
      voterHash,
      electionId,
      used: false,
      expiresAt: { gt: new Date() }
    }
  });

  if (existingToken) {
    return res.json({
      token: existingToken.token,
      expiresAt: existingToken.expiresAt
    });
  }

  // Generate new token
  const token = cryptoService.generateAnonymousToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const votingToken = await prisma.votingToken.create({
    data: {
      token,
      voterHash,
      electionId,
      constituencyId: voter.constituencyId,
      expiresAt
    }
  });

  res.json({
    token: votingToken.token,
    expiresAt: votingToken.expiresAt
  });
});

export const castVote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, candidateId, electionId } = req.body;

  if (!token || !candidateId || !electionId) {
    throw new BadRequestError('Token, candidate ID, and election ID are required');
  }

  // Verify token
  const votingToken = await prisma.votingToken.findUnique({
    where: { token }
  });

  if (!votingToken || votingToken.used || votingToken.expiresAt < new Date()) {
    throw new BadRequestError('Invalid or expired voting token');
  }

  // Prepare vote data
  const vote = {
    candidateId,
    electionId,
    timestamp: new Date().toISOString(),
    constituencyId: votingToken.constituencyId
  };

  // Encrypt vote
  const encryptedVote = cryptoService.encryptVote(vote);
  const encryptedVoteString = JSON.stringify(encryptedVote);

  // Generate ZK proof
  const zkProof = cryptoService.generateZKProof(vote);

  // Submit to blockchain
  const blockchainTokenHex = cryptoService.hashForBlockchain(token);
  
  try {
    const tx = await blockchainService.submitVote(
      blockchainTokenHex,
      encryptedVoteString,
      zkProof,
      votingToken.constituencyId
    );

    // Mark voter as voted
    await blockchainService.markVoted(votingToken.voterHash);

    // Mark token as used
    await prisma.votingToken.update({
      where: { token },
      data: { used: true }
    });

    // Extract vote ID from transaction events
    const voteId = tx.logs[0]?.topics[1] || 'unknown';

    // Create receipt
    const receipt = await prisma.voteReceipt.create({
      data: {
        receiptId: cryptoService.generateAnonymousToken(),
        voteId,
        blockNumber: Number(tx.blockNumber),
        transactionHash: tx.transactionHash,
        constituencyId: votingToken.constituencyId,
        zkProofHash: cryptoService.hashForBlockchain(zkProof)
      }
    });

    res.json({
      message: 'Vote cast successfully',
      receipt: {
        receiptId: receipt.receiptId,
        voteId: receipt.voteId,
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.transactionHash,
        timestamp: receipt.timestamp
      }
    });

  } catch (error) {
    throw new BadRequestError('Failed to submit vote to blockchain');
  }
});