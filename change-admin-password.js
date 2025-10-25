const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function changeAdminPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Prompt for new password (you can modify this)
    const newPassword = process.argv[2];
    
    if (!newPassword) {
      console.log('❌ Please provide a new password as an argument');
      console.log('Usage: node change-admin-password.js <new-password>');
      process.exit(1);
    }

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin', email: 'admin@clothingstore.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update admin password
    await User.findByIdAndUpdate(adminUser._id, { password: hashedPassword });
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: admin@clothingstore.com');
    console.log('🔑 New Password: ' + newPassword);
    
  } catch (error) {
    console.error('❌ Failed to change admin password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
changeAdminPassword();
