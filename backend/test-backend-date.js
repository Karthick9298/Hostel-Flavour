import fetch from 'node-fetch';

async function testBackendDate() {
  try {
    // Test the health endpoint first
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.text();
    console.log('Health check:', healthData);

    // Try to get today's menu to see what date the backend thinks is "today"
    const menuResponse = await fetch('http://localhost:5000/api/menu/today');
    const menuData = await menuResponse.json();
    console.log('Menu response:', JSON.stringify(menuData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testBackendDate();
