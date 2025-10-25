require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function verifyDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const productCount = await Product.countDocuments();
    console.log(`Total products in database: ${productCount}`);
    
    if (productCount > 0) {
      const products = await Product.find({}).select('name _id isActive isFeatured');
      console.log('\nProducts found:');
      products.forEach(p => {
        console.log(`- ${p.name} (ID: ${p._id}, Active: ${p.isActive}, Featured: ${p.isFeatured})`);
      });
      
      // Delete all products
      await Product.deleteMany({});
      console.log('\n✅ All products deleted');
    } else {
      console.log('✅ Database is empty - no products found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyDatabase();
