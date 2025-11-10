import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.route('/profile').get(auth, getProfile).put(auth, updateProfile);

export default router;
