const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@clothingstore.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';

async function quickTest() {
  try {
    console.log('🧪 Testing login API...');
    console.log(`📍 URL: ${API_BASE_URL}/api/auth/login`);
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ LOGIN SUCCESS:');
    console.log(`   Email: ${response.data.user.email}`);
    console.log(`   Role: ${response.data.user.role}`);
    console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ HEALTH CHECK:', healthResponse.data.status);
    
  } catch (error) {
    console.log('❌ TEST FAILED:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

quickTest();
