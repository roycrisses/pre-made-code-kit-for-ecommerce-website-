const mongoose = require('mongoose');
require('dotenv').config();

class MongoDBConfig {
  static async checkConnection() {
    try {
      console.log('🔍 Checking MongoDB configuration...');
      console.log('📍 Connection URI:', process.env.MONGODB_URI);
      
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      
      console.log('✅ MongoDB connection successful!');
      console.log('📊 Database:', mongoose.connection.name);
      console.log('🌐 Host:', mongoose.connection.host);
      console.log('🔌 Port:', mongoose.connection.port);
      
      return true;
    } catch (error) {
      console.log('❌ MongoDB connection failed');
      console.log('Error:', error.message);
      
      this.provideSolutions(error);
      return false;
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    }
  }
  
  static provideSolutions(error) {
    console.log('\n💡 Quick Solutions:');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.log('🔧 MongoDB is not running. Choose one option:');
      console.log('');
      console.log('Option 1 - MongoDB Atlas (Recommended - 5 minutes):');
      console.log('1. Go to https://www.mongodb.com/atlas');
      console.log('2. Create free account and cluster');
      console.log('3. Get connection string');
      console.log('4. Update MONGODB_URI in .env file');
      console.log('');
      console.log('Option 2 - Install MongoDB locally:');
      console.log('1. Run: PowerShell -ExecutionPolicy Bypass -File install-mongodb.ps1');
      console.log('2. Or download from: https://www.mongodb.com/try/download/community');
    }
    
    if (error.message.includes('authentication')) {
      console.log('🔐 Authentication failed:');
      console.log('1. Check username/password in connection string');
      console.log('2. Verify database user permissions');
    }
    
    console.log('\n📚 See mongodb-setup-guide.md for detailed instructions');
  }
  
  static generateAtlasConnectionString(username, password, cluster, database = 'clothing_store') {
    return `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;
  }
  
  static generateLocalConnectionString(host = 'localhost', port = 27017, database = 'clothing_store') {
    return `mongodb://${host}:${port}/${database}`;
  }
}

// Run check if called directly
if (require.main === module) {
  MongoDBConfig.checkConnection().then(success => {
    if (success) {
      console.log('\n🎉 Your MongoDB is ready for the ecommerce application!');
      console.log('💻 Next steps:');
      console.log('1. Run: npm run init-db (to set up initial data)');
      console.log('2. Run: npm start (to start the application)');
    } else {
      console.log('\n⚠️ Please fix MongoDB connection before proceeding');
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = MongoDBConfig;
