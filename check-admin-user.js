const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function checkAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    console.log(`\n📊 Found ${adminUsers.length} admin user(s):`);
    
    adminUsers.forEach((admin, index) => {
      console.log(`\n👤 Admin ${index + 1}:`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Name: ${admin.name}`);
      console.log(`🔑 Password Hash: ${admin.password ? 'Set' : 'Not Set'}`);
      console.log(`📅 Created: ${admin.createdAt}`);
      console.log(`✅ Active: ${admin.isActive}`);
    });

    // Test common passwords
    const testPasswords = ['admin123', 'YourNewPassword123', 'admin', 'password'];
    
    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log(`\n🔍 Testing passwords for ${admin.email}:`);
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, admin.password);
          console.log(`🔑 "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
        } catch (error) {
          console.log(`🔑 "${testPassword}": ❌ Error testing`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run the script
checkAdminUser();
