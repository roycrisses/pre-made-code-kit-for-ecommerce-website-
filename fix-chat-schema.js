const mongoose = require('mongoose');
require('dotenv').config();

async function fixChatSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Drop the chats collection to remove old schema data
    const db = mongoose.connection.db;
    
    try {
      await db.collection('chats').drop();
      console.log('✅ Dropped existing chats collection (old schema)');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️ No existing chats collection found');
      } else {
        console.log('⚠️ Error dropping chats collection:', error.message);
      }
    }

    console.log('✅ Chat schema cleanup complete!');
    console.log('ℹ️ New chats will use the updated schema format');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the fix
fixChatSchema();
