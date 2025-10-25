const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test basic operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted successfully');
    
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Test document deleted successfully');
    
    console.log('🎉 MongoDB is ready for your ecommerce application!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB service is started');
      console.log('3. Verify the connection URI in .env file');
      console.log('4. Consider using MongoDB Atlas (cloud) for easier setup');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication issue:');
      console.log('1. Check username and password in connection URI');
      console.log('2. Verify database user permissions');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
}

testMongoConnection();
