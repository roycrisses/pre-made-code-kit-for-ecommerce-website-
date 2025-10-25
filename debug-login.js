const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function debugLogin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@clothingstore.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('🔧 Run: node fix-admin-login.js');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Role:', adminUser.role);
    console.log('🔍 Active:', adminUser.isActive);
    console.log('✅ Verified:', adminUser.isVerified);

    // Test password
    const passwordTest = await adminUser.comparePassword('admin123');
    console.log('🔑 Password test:', passwordTest ? '✅ CORRECT' : '❌ WRONG');

    if (!passwordTest) {
      console.log('🔧 Password mismatch - recreating admin...');
      await User.deleteOne({ email: 'admin@clothingstore.com' });
      
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@clothingstore.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ Admin recreated successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

debugLogin();
