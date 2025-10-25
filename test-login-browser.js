// Open browser console and run this to test login directly
fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@clothingstore.com',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login result:', data);
  if (data.token) {
    console.log('✅ SUCCESS - Token received');
  } else {
    console.log('❌ FAILED - No token');
  }
})
.catch(error => {
  console.log('❌ ERROR:', error);
});
