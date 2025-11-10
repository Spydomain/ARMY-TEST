import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  getRandomQuestions,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';

const router = express.Router();

// Public routes
router.get('/random/:category', getRandomQuestions);

// Admin routes
router.get('/', auth, adminAuth, getAllQuestions);
router.post('/', auth, adminAuth, createQuestion);
router.put('/:id', auth, adminAuth, updateQuestion);
router.delete('/:id', auth, adminAuth, deleteQuestion);

export default router;
