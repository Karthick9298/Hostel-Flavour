import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      // For development, we'll use a simplified approach without service account
      // This allows the app to work with Firebase Auth without requiring service account keys
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'hostel-food-analysis',
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      console.log('Note: Some Firebase features may not work without proper service account setup');
    }
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize on import
initializeFirebaseAdmin();

export default admin;
