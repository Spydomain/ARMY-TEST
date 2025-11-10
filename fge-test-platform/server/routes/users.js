import express from 'express';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.js';

const router = express.Router();

// Admin routes
router.get('/', auth, adminAuth, getAllUsers);
router.get('/:id', auth, adminAuth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, adminAuth, deleteUser);
router.put('/:id/role', auth, adminAuth, updateUserRole);

export default router;
