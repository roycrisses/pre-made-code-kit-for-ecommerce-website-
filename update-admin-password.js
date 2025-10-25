const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function updateAdminPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // New secure password
    const newPassword = 'AdminSecure2024!';

    // Find admin user
    const adminUser = await User.findOne({ 
      role: 'admin', 
      email: 'admin@clothingstore.com' 
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('👤 Found admin user:', adminUser.email);

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update admin password
    await User.findByIdAndUpdate(adminUser._id, { 
      password: hashedPassword 
    });
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: admin@clothingstore.com');
    console.log('🔑 New Password: AdminSecure2024!');
    
  } catch (error) {
    console.error('❌ Failed to update admin password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run the script
updateAdminPassword();
