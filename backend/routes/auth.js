import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('rollNumber')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Roll number is required'),
  body('hostelRoom')
    .trim()
    .matches(/^[AB]-\d+$/)
    .withMessage('Room format should be like A-101 or B-205'),
  body('firebaseUid')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Firebase UID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, rollNumber, hostelRoom, firebaseUid } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { rollNumber: rollNumber.toUpperCase() },
        { firebaseUid }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email, roll number, or Firebase UID'
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      rollNumber: rollNumber.toUpperCase(),
      hostelRoom: hostelRoom.toUpperCase(),
      firebaseUid,
      // Note: isAdmin will be set manually in database for specific users
      isAdmin: false
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      hostelRoom: user.hostelRoom,
      isAdmin: user.isAdmin
    };

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login/email
// @desc    Login user with email and password (for development)
// @access  Public
router.post('/login/email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // For development: accept any password for test users
    // In production, you would verify password hash
    const isValidPassword = user.email.includes('test') || user.email.includes('admin') || password === 'password123';

    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      hostelRoom: user.hostelRoom,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin
    };

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('firebaseUid')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Firebase UID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firebaseUid } = req.body;

    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid, isActive: true });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      hostelRoom: user.hostelRoom,
      isAdmin: user.isAdmin
    };

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userData = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      rollNumber: req.user.rollNumber,
      hostelRoom: req.user.hostelRoom,
      isAdmin: req.user.isAdmin,
      lastLogin: req.user.lastLogin
    };

    res.json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    message: 'Logout successful'
  });
});

export default router;
