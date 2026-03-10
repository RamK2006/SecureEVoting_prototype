import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cryptoService from '../services/crypto.service';
import blockchainService from '../services/blockchain.service';
import { generateToken } from '../middleware/auth';
import { BadRequestError, ConflictError, UnauthorizedError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { nationalId, password, constituencyId } = req.body;

  if (!nationalId || !password || !constituencyId) {
    throw new BadRequestError('National ID, password, and constituency are required');
  }

  if (nationalId.length !== 12) {
    throw new BadRequestError('National ID must be 12 digits');
  }

  if (password.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters');
  }

  // Hash voter identity
  const voterHash = cryptoService.hashVoterIdentity(nationalId);

  // Check if voter already exists
  const existingVoter = await prisma.voter.findUnique({
    where: { voterHash }
  });

  if (existingVoter) {
    throw new ConflictError('Voter already registered');
  }

  // Hash password
  const passwordHash = await cryptoService.hashPassword(password);

  // Register on blockchain
  try {
    await blockchainService.registerVoter(voterHash, constituencyId);
  } catch (error) {
    throw new BadRequestError('Blockchain registration failed');
  }

  // Store in database with separate auth credentials
  const voter = await prisma.voter.create({
    data: {
      voterHash,
      constituencyId,
      authCredentials: {
        create: {
          passwordHash,
          otpSecret: cryptoService.generateAnonymousToken()
        }
      }
    }
  });

  res.status(201).json({
    message: 'Voter registered successfully',
    voterHash: voter.voterHash
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { nationalId, password } = req.body;

  if (!nationalId || !password) {
    throw new BadRequestError('National ID and password are required');
  }

  // Hash voter identity
  const voterHash = cryptoService.hashVoterIdentity(nationalId);

  // Find voter with auth credentials
  const voter = await prisma.voter.findUnique({
    where: { voterHash },
    include: { authCredentials: true }
  });

  if (!voter || !voter.authCredentials) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if account is locked
  if (voter.authCredentials.lockedUntil && voter.authCredentials.lockedUntil > new Date()) {
    throw new UnauthorizedError('Account temporarily locked due to failed login attempts');
  }

  // Verify password
  const isValidPassword = await cryptoService.verifyPassword(password, voter.authCredentials.passwordHash);
  if (!isValidPassword) {
    // Increment failed attempts
    await prisma.authCredentials.update({
      where: { voterHash },
      data: {
        failedAttempts: { increment: 1 },
        lockedUntil: voter.authCredentials.failedAttempts >= 4 ? 
          new Date(Date.now() + 15 * 60 * 1000) : // Lock for 15 minutes after 5 failed attempts
          undefined
      }
    });
    throw new UnauthorizedError('Invalid credentials');
  }

  // Reset failed attempts on successful login
  if (voter.authCredentials.failedAttempts > 0) {
    await prisma.authCredentials.update({
      where: { voterHash },
      data: {
        failedAttempts: 0,
        lockedUntil: null
      }
    });
  }

  // Generate JWT token
  const token = generateToken(voterHash);

  res.json({
    message: 'Login successful',
    token,
    voterHash: voter.voterHash,
    constituencyId: voter.constituencyId
  });
});