import express from 'express';
import { auth } from '../middleware/auth.js';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
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

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontend}/auth/callback?token=${encodeURIComponent(token)}`;
    res.redirect(302, redirectUrl);
  }
);

// Protected routes
router.route('/profile').get(auth, getProfile).put(auth, updateProfile);

export default router;
