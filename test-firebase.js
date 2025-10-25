const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

// Test Firestore connection
async function testFirestore() {
  try {
    console.log('\n🔥 Testing Firestore connection...');
    
    const db = admin.firestore();
    
    // Test write
    const testDoc = await db.collection('test').add({
      message: 'Hello Firebase!',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Firestore write test successful, document ID:', testDoc.id);
    
    // Test read
    const doc = await testDoc.get();
    console.log('✅ Firestore read test successful, data:', doc.data());
    
    // Clean up test document
    await testDoc.delete();
    console.log('✅ Test document cleaned up');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
  }
}

// Test Firebase Storage
async function testStorage() {
  try {
    console.log('\n📦 Testing Firebase Storage...');
    
    const bucket = admin.storage().bucket();
    
    // Test bucket access
    const [exists] = await bucket.exists();
    if (exists) {
      console.log('✅ Storage bucket exists and accessible');
    } else {
      console.log('❌ Storage bucket not found');
    }
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Firebase connection tests...\n');
  
  await testFirestore();
  await testStorage();
  
  console.log('\n🎉 Firebase tests completed!');
  process.exit(0);
}

runTests();
