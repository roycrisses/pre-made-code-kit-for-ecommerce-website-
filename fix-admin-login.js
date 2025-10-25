const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function fixAdminLogin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Remove any existing admin users to avoid conflicts
    const deletedCount = await User.deleteMany({ 
      $or: [
        { role: 'admin' },
        { email: 'admin@clothingstore.com' }
      ]
    });
    console.log(`🗑️ Removed ${deletedCount.deletedCount} existing admin user(s)`);

    // Create fresh admin user with simple credentials
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@clothingstore.com',
      password: 'admin123', // This will be automatically hashed by the pre-save hook
      role: 'admin',
      phone: '+977-9800000000',
      isVerified: true,
      isActive: true,
      address: {
        street: '123 Admin Street',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        country: 'Nepal'
      }
    });

    const savedAdmin = await adminUser.save();
    console.log('✅ Fresh admin user created successfully!');
    console.log('');
    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('📧 Email: admin@clothingstore.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('👤 Admin ID:', savedAdmin._id);
    console.log('📅 Created:', savedAdmin.createdAt);

    // Verify the password works
    const testLogin = await savedAdmin.comparePassword('admin123');
    console.log('🔍 Password verification:', testLogin ? '✅ SUCCESS' : '❌ FAILED');

  } catch (error) {
    console.error('❌ Error fixing admin login:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

fixAdminLogin();
