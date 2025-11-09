import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password, // Password will be hashed by the model hook
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      theme: user.theme,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user.id);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { username, email, password, preferredLanguage, theme } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.username = username || user.username;
      user.email = email || user.email;
      user.preferredLanguage = preferredLanguage || user.preferredLanguage;
      user.theme = theme || user.theme;
      
      if (password) {
        user.password = password; // Will be hashed by the model hook
      }

      const updatedUser = await user.save();
      
      // Remove password from response
      const { password: _, ...userData } = updatedUser.toJSON();
      
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
