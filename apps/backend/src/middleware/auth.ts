import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config/env';
import { UnauthorizedError } from './errorHandler';

export interface AuthRequest extends Request {
  voterHash?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Access token required');
  }

  jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
    if (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }
    req.voterHash = decoded.voterHash;
    next();
  });
};

export const generateToken = (voterHash: string): string => {
  return jwt.sign({ voterHash }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};