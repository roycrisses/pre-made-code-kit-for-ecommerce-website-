const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Delete existing admin user
    await User.deleteMany({ role: 'admin' });
    console.log('Deleted existing admin users');

    // Create new admin with known password
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@clothingstore.com',
      password: 'admin123',
      role: 'admin',
      phone: '+977-9800000000',
      isVerified: true,
      isActive: true
    });

    await adminUser.save();
    console.log('✅ New admin user created');
    console.log('📧 Email: admin@clothingstore.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

resetAdmin();
