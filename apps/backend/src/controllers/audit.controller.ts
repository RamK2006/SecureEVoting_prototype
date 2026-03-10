import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import blockchainService from '../services/blockchain.service';
import { NotFoundError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const verifyReceipt = asyncHandler(async (req: Request, res: Response) => {
  const { receiptId } = req.params;

  if (!receiptId) {
    throw new NotFoundError('Receipt ID is required');
  }

  // Find receipt in database
  const receipt = await prisma.voteReceipt.findUnique({
    where: { receiptId }
  });

  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Get vote details from blockchain
  try {
    const blockchainVote = await blockchainService.getVote(receipt.voteId);
    
    res.json({
      receiptId: receipt.receiptId,
      voteId: receipt.voteId,
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.transactionHash,
      timestamp: receipt.timestamp,
      constituencyId: receipt.constituencyId,
      verified: true,
      blockchainData: {
        encryptedVote: blockchainVote[0],
        blockNumber: Number(blockchainVote[1]),
        timestamp: new Date(Number(blockchainVote[2]) * 1000),
        constituencyId: blockchainVote[3]
      }
    });
  } catch (error) {
    res.json({
      receiptId: receipt.receiptId,
      voteId: receipt.voteId,
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.transactionHash,
      timestamp: receipt.timestamp,
      constituencyId: receipt.constituencyId,
      verified: false,
      error: 'Could not verify on blockchain'
    });
  }
});

export const getPublicStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get total votes from blockchain
    const totalVotes = await blockchainService.getTotalVotes();

    // Get constituency breakdown
    const constituencies = ['const-001', 'const-002', 'const-003', 'const-004', 'const-005'];
    const constituencyStats = [];

    for (const constituencyId of constituencies) {
      const voteCount = await blockchainService.getConstituencyVoteCount(constituencyId);
      constituencyStats.push({
        constituencyId,
        voteCount
      });
    }

    // Get recent receipts
    const recentReceipts = await prisma.voteReceipt.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      select: {
        receiptId: true,
        blockNumber: true,
        timestamp: true,
        constituencyId: true
      }
    });

    res.json({
      totalVotes,
      constituencyStats,
      recentReceipts,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.json({
      totalVotes: 0,
      constituencyStats: [],
      recentReceipts: [],
      lastUpdated: new Date(),
      error: 'Could not fetch blockchain stats'
    });
  }
});