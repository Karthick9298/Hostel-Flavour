// Simple script to create a test user
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function createTestUser() {
  try {
    // First, we need to create a Firebase user, but for testing let's create a backend user directly
    // with a mock Firebase UID
    
    const userData = {
      name: 'Test Student',
      email: 'test@gvpce.ac.in',
      rollNumber: 'TEST001',
      hostelRoom: 'A-101',
      firebaseUid: 'test-firebase-uid-123'
    };

    console.log('Creating test user...');
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    console.log('Registration result:', result);

    if (result.status === 'success') {
      console.log('✅ Test user created successfully!');
      console.log('User ID:', result.data.user._id);
      console.log('Token:', result.data.token);
      
      // Test login
      console.log('\nTesting login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseUid: 'test-firebase-uid-123' })
      });

      const loginResult = await loginResponse.json();
      console.log('Login result:', loginResult);
      
      if (loginResult.status === 'success') {
        console.log('✅ Login test successful!');
      } else {
        console.log('❌ Login test failed:', loginResult.message);
      }
    } else {
      console.log('❌ User creation failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
