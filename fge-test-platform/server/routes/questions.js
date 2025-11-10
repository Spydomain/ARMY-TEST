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
router.get('/random/:category', async (req, res, next) => {
  try {
    await getRandomQuestions(req, res, next);
  } catch (error) {
    console.error('Error in /random/:category route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Admin routes
router.get('/', auth, adminAuth, getAllQuestions);
router.post('/', auth, adminAuth, createQuestion);
router.put('/:id', auth, adminAuth, updateQuestion);
router.delete('/:id', auth, adminAuth, deleteQuestion);

export default router;
