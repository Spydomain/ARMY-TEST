import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  startTest,
  submitAnswer,
  getTestResults,
  getTestHistory,
  getLeaderboard,
} from '../controllers/testController.js';

const router = express.Router();

// Test session management
router.post('/start', auth, startTest);
router.post('/:testId/answer', auth, submitAnswer);

// Test results and history
router.get('/:testId/results', auth, getTestResults);
router.get('/history', auth, getTestHistory);

// Public leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
