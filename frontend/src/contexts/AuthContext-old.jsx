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

  // Initialize user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Check localStorage for existing user
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Restored user from localStorage:', user.name);
        setUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    
    setLoading(false);
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

      // Register user in our backend
      const backendData = {
        ...userData,
        firebaseUid: firebaseUser.uid
      };
      delete backendData.password; // Don't send password to backend

      const response = await authAPI.register(backendData);
      
      if (response.status === 'success') {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Registration successful!');
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error('Registration error:', error);
      // If backend registration fails, delete Firebase user
      if (firebaseUser) {
        await firebaseUser.delete();
      }
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
      console.log('Attempting login with:', email);
      
      // Use direct email/password authentication (bypassing Firebase for now)
      const response = await authAPI.loginWithEmail({ email, password });
      console.log('Backend login response:', response);
      
      if (response.status === 'success') {
        // Set token and user data immediately
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update state
        setUser(response.data.user);
        
        console.log('Login successful, user set:', response.data.user.name);
        toast.success('Login successful!');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Clean up on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
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
      
      // Login to our backend
      const response = await authAPI.login({ firebaseUid: firebaseUser.uid });
      
      if (response.status === 'success') {
        // Set token first
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Then update state
        setUser(response.data.user);
        
        toast.success('Login successful!');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      // Clean up on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      toast.error(error.message || 'Google login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
      
      // Only sign out from Firebase if not in mock mode
      if (import.meta.env.VITE_MOCK_AUTH !== 'true') {
        await signOut(auth);
      }
      
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (import.meta.env.VITE_MOCK_AUTH !== 'true') {
        try {
          await signOut(auth);
        } catch (firebaseError) {
          console.error('Firebase logout error:', firebaseError);
        }
      }
      
      toast.success('Logged out successfully');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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
