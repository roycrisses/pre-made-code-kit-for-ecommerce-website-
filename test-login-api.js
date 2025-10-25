const axios = require('axios');

async function testLoginAPI() {
  console.log('🔄 Testing login API on both ports...');
  
  // Test port 5001 first
  try {
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@clothingstore.com',
      password: 'admin123'
    });
    
    console.log('✅ Login API Success on port 5001!');
    console.log('📧 User:', response.data.user.email);
    console.log('👤 Role:', response.data.user.role);
    console.log('🔑 Token received:', response.data.token ? 'YES' : 'NO');
    return;
    
  } catch (error) {
    console.log('❌ Port 5001 Failed:', error.response?.data?.message || error.message);
  }
  
  // Test port 5000 as fallback
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@clothingstore.com',
      password: 'admin123'
    });
    
    console.log('✅ Login API Success on port 5000!');
    console.log('📧 User:', response.data.user.email);
    console.log('👤 Role:', response.data.user.role);
    console.log('🔑 Token received:', response.data.token ? 'YES' : 'NO');
    
  } catch (error) {
    console.log('❌ Port 5000 Failed:', error.response?.data?.message || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 No server running on either port');
    }
  }
}

testLoginAPI();
