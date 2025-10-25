require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function clearAllProducts() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get count of existing products
    const count = await Product.countDocuments();
    console.log(`Found ${count} products in database`);
    
    if (count > 0) {
      // List all products before deletion
      const products = await Product.find({}).select('_id name');
      console.log('\n=== Products to be deleted ===');
      products.forEach(p => {
        console.log(`- ${p.name} (ID: ${p._id})`);
      });
      
      // Delete all products
      const result = await Product.deleteMany({});
      console.log(`\n✅ Successfully deleted ${result.deletedCount} products`);
    } else {
      console.log('No products found in database');
    }
    
    // Verify deletion
    const finalCount = await Product.countDocuments();
    console.log(`\nFinal product count: ${finalCount}`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

clearAllProducts();
