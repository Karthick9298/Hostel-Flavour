import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateFirebaseToken } from '../middleware/firebaseAuth.js';
import { verifyFirebaseToken } from '../config/firebase-admin.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user with Firebase UID
// @access  Public (but requires valid Firebase token)
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('rollNumber')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Roll number is required'),
  body('hostelRoom')
    .trim()
    .matches(/^[AB]-\d+$/)
    .withMessage('Room format should be like A-101 or B-205'),
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

    const { name, rollNumber, hostelRoom } = req.body;
    
    // Get Firebase token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Firebase token required'
      });
    }

    const idToken = authHeader.substring(7);
    
    // Verify Firebase token
    const firebaseResult = await verifyFirebaseToken(idToken);
    if (!firebaseResult.success) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Firebase token'
      });
    }

    const { uid: firebaseUid, email } = firebaseResult;

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
      isAdmin: false
    });

    await user.save();

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      hostelRoom: user.hostelRoom,
      isAdmin: user.isAdmin,
      firebaseUid: user.firebaseUid
    };

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userData
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

// @route   POST /api/auth/sync-user
// @desc    Sync user data after Firebase login (create if doesn't exist)
// @access  Private (requires Firebase token)
router.post('/sync-user', async (req, res) => {
  try {
    // Get Firebase token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Firebase token required'
      });
    }

    const idToken = authHeader.substring(7);
    
    // Verify Firebase token
    const firebaseResult = await verifyFirebaseToken(idToken);
    if (!firebaseResult.success) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Firebase token'
      });
    }

    const { uid: firebaseUid, email } = firebaseResult;

    // Find existing user
    let user = await User.findOne({ firebaseUid, isActive: true });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please complete registration first.',
        requiresRegistration: true
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user data
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
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync user data'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateFirebaseToken, async (req, res) => {
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
// @desc    Logout user (client-side only with Firebase)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export default router;
