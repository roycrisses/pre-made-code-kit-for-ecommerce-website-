const mongoose = require('mongoose');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Import User model after connection
    const User = require('./models/User');

    // Remove existing admin to avoid conflicts
    await User.deleteMany({ email: 'admin@clothingstore.com' });
    console.log('Cleared existing admin user');

    // Create new admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@clothingstore.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('Email: admin@clothingstore.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
