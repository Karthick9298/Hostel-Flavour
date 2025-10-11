import { verifyFirebaseToken } from '../config/firebase-admin.js';
import User from '../models/User.js';

// Middleware to authenticate Firebase tokens
export const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(idToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    // Find user in our database using Firebase UID
    const user = await User.findOne({ 
      firebaseUid: verificationResult.uid,
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    req.firebaseUser = verificationResult;
    
    next();
  } catch (error) {
    console.error('Firebase authentication error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  next();
};
