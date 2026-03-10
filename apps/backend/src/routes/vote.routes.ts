import { Router } from 'express';
import { getVoterStatus, getCurrentElection, generateVotingToken, castVote } from '../controllers/vote.controller';
import { authenticateToken } from '../middleware/auth';
import { voteCastLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/voter/status', authenticateToken, getVoterStatus);
router.get('/election/current', getCurrentElection);
router.post('/vote/token', authenticateToken, generateVotingToken);
router.post('/vote/cast', voteCastLimiter, castVote);

export default router;