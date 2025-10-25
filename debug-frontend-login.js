// Test what the frontend is actually sending
const axios = require('axios');

async function testFrontendLogin() {
  console.log('🔍 Testing frontend login flow...');
  
  // Test 1: Direct API call (what should work)
  try {
    console.log('\n1️⃣ Testing direct API call to port 5001...');
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@clothingstore.com',
      password: 'admin123'
    });
    console.log('✅ Direct API Success:', response.data.user.email, response.data.user.role);
  } catch (error) {
    console.log('❌ Direct API Failed:', error.response?.data?.message || error.message);
  }
  
  // Test 2: Proxy call (what frontend uses)
  try {
    console.log('\n2️⃣ Testing proxy call (frontend style)...');
    const response = await axios.post('/api/auth/login', {
      email: 'admin@clothingstore.com',
      password: 'admin123'
    }, {
      baseURL: 'http://localhost:3000'
    });
    console.log('✅ Proxy Success:', response.data.user.email, response.data.user.role);
  } catch (error) {
    console.log('❌ Proxy Failed:', error.response?.data?.message || error.message);
  }
  
  // Test 3: Check if server is responding
  try {
    console.log('\n3️⃣ Testing server health...');
    const response = await axios.get('http://localhost:5001/');
    console.log('✅ Server responding');
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
  }
}

testFrontendLogin();
