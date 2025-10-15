import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.email);
      setFirebaseUser(firebaseUser);
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Set token in API headers
          localStorage.setItem('firebaseToken', idToken);
          
          // Sync user data with our backend
          const response = await authAPI.syncUser();
          
          if (response.status === 'success') {
            setUser(response.data.user);
            console.log('User synced successfully:', response.data.user.email);
          } else if (response.requiresRegistration) {
            // User needs to complete registration
            console.log('User needs to complete registration');
            setUser(null);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebaseToken');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register with email and password
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Create Firebase user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      localStorage.setItem('firebaseToken', idToken);

      // Register user in our backend
      const response = await authAPI.register(userData);
      
      if (response.status === 'success') {
        setUser(response.data.user);
        toast.success('Registration successful!');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // If backend registration fails, delete Firebase user
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      
      setUser(null);
      localStorage.removeItem('firebaseToken');
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Sign in with Firebase
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      localStorage.setItem('firebaseToken', idToken);

      console.log('Firebase ID token obtained');
      console.log(idToken);// remove this in future
      // Sync user data with our backend
      const response = await authAPI.syncUser();
      
      if (response.status === 'success') {
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true, user: response.data.user };
      } else if (response.requiresRegistration) {
        // User exists in Firebase but not in our backend
        toast.error('Please complete your profile setup');
        return { success: false, error: 'Registration required', requiresRegistration: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      setUser(null);
      localStorage.removeItem('firebaseToken');
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google (for production with GVPCE domain)
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        hd: 'gvpce.ac.in' // Restrict to GVPCE domain
      });
      
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      // Check if email is from GVPCE domain
      if (!firebaseUser.email.endsWith('@gvpce.ac.in')) {
        await signOut(auth);
        throw new Error('Please use your GVPCE email address');
      }
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      localStorage.setItem('firebaseToken', idToken);

      // Sync user data with our backend
      const response = await authAPI.syncUser();
      
      if (response.status === 'success') {
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true, user: response.data.user };
      } else if (response.requiresRegistration) {
        toast.error('Please complete your profile setup');
        return { success: false, error: 'Registration required', requiresRegistration: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      setUser(null);
      localStorage.removeItem('firebaseToken');
      toast.error(error.message || 'Google login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('firebaseToken');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
