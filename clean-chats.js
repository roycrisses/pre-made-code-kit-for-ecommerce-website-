const mongoose = require('mongoose');
require('dotenv').config();

async function cleanChats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Simply delete all existing chats to avoid schema conflicts
    const result = await mongoose.connection.db.collection('chats').deleteMany({});
    console.log(`Deleted ${result.deletedCount} existing chat documents`);
    
    console.log('Chat cleanup complete - ready for new schema');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

cleanChats();
