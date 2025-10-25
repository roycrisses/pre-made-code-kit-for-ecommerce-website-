const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function testProductDeletion() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all products
    const products = await Product.find({}).select('_id name isActive');
    console.log('\n=== Products in database ===');
    products.forEach(p => {
      console.log(`ID: ${p._id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Active: ${p.isActive}`);
      console.log('---');
    });
    
    if (products.length > 0) {
      const testId = products[0]._id;
      console.log(`\n=== Testing deletion of product: ${testId} ===`);
      
      // Test if we can find it
      const foundProduct = await Product.findById(testId);
      console.log('Found with findById:', !!foundProduct);
      
      const foundProduct2 = await Product.findOne({ _id: testId });
      console.log('Found with findOne:', !!foundProduct2);
      
      // Test ObjectId validation
      console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testId.toString()));
      console.log('ID string:', testId.toString());
      console.log('ID length:', testId.toString().length);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testProductDeletion();
