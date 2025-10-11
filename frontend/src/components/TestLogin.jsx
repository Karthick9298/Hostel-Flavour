// Test the login flow without Firebase
// This creates a simple test page to test direct backend login

import React, { useState } from 'react';
import { authAPI } from '../config/api';

const TestLogin = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authAPI.login({ firebaseUid: 'test-firebase-uid-123' });
      console.log('Direct API login result:', response);
      setResult(response);
      
      if (response.status === 'success') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Token and user set in localStorage');
      }
    } catch (error) {
      console.error('Test login error:', error);
      setResult({ error: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login</h1>
      <button 
        onClick={testLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Direct Login'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Result:</h2>
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestLogin;
