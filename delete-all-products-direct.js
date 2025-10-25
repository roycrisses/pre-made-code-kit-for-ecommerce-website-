const { MongoClient } = require('mongodb');

async function deleteAllProducts() {
  const uri = 'mongodb+srv://clothingstore:clothingstore123@cluster0.prhaerj.mongodb.net/clothing_store?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('clothing_store');
    const collection = db.collection('products');
    
    // Count existing products
    const count = await collection.countDocuments();
    console.log(`Found ${count} products`);
    
    if (count > 0) {
      // List products
      const products = await collection.find({}).project({ name: 1, _id: 1 }).toArray();
      console.log('\nProducts to delete:');
      products.forEach(p => console.log(`- ${p.name} (${p._id})`));
      
      // Delete all
      const result = await collection.deleteMany({});
      console.log(`\nDeleted ${result.deletedCount} products`);
    } else {
      console.log('No products found');
    }
    
    // Verify
    const finalCount = await collection.countDocuments();
    console.log(`Final count: ${finalCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

deleteAllProducts();
