const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    
    // Product indexes
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ isActive: 1 });
    await Product.collection.createIndex({ isFeatured: 1 });
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    
    console.log('✅ Database indexes created');

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('👤 Creating default admin user...');
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@clothingstore.com',
        password: 'admin123',
        role: 'admin',
        phone: '+977-9800000000',
        address: {
          street: '123 Admin Street',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@clothingstore.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('👤 Admin user already exists');
    }

    // Check if sample products exist
    const productCount = await Product.countDocuments();
    
    // Only create sample products if explicitly requested via environment variable
    if (productCount === 0 && process.env.CREATE_SAMPLE_PRODUCTS === 'true') {
      console.log('🛍️ Creating sample products...');
      
      const sampleProducts = [
        {
          name: 'Classic Cotton T-Shirt',
          description: 'Comfortable 100% cotton t-shirt perfect for everyday wear',
          price: 1200,
          category: 'shirts',
          brand: 'ClothingStore',
          sizes: [
            { size: 'S', quantity: 20 },
            { size: 'M', quantity: 25 },
            { size: 'L', quantity: 15 },
            { size: 'XL', quantity: 10 }
          ],
          colors: [
            { color: 'White', colorCode: '#FFFFFF' },
            { color: 'Black', colorCode: '#000000' },
            { color: 'Navy', colorCode: '#000080' },
            { color: 'Gray', colorCode: '#808080' }
          ],
          images: [{
            data: '/uploads/sample-tshirt.jpg',
            contentType: 'image/jpeg',
            alt: 'Classic Cotton T-Shirt',
            isPrimary: true
          }],
          material: '100% Cotton',
          careInstructions: 'Machine wash cold, tumble dry low',
          tags: ['casual', 'cotton', 'basic'],
          isActive: true,
          isFeatured: true,
          createdBy: adminExists ? adminExists._id : null
        },
        {
          name: 'Denim Jeans',
          description: 'Classic blue denim jeans with comfortable fit',
          price: 3500,
          category: 'pants',
          brand: 'ClothingStore',
          sizes: [
            { size: '28', quantity: 8 },
            { size: '30', quantity: 12 },
            { size: '32', quantity: 15 },
            { size: '34', quantity: 10 },
            { size: '36', quantity: 5 }
          ],
          colors: [
            { color: 'Blue', colorCode: '#0066CC' },
            { color: 'Black', colorCode: '#000000' },
            { color: 'Dark Blue', colorCode: '#003366' }
          ],
          images: [{
            data: '/uploads/sample-jeans.jpg',
            contentType: 'image/jpeg',
            alt: 'Denim Jeans',
            isPrimary: true
          }],
          material: '98% Cotton, 2% Elastane',
          careInstructions: 'Machine wash cold, hang dry',
          tags: ['denim', 'casual', 'jeans'],
          isActive: true,
          isFeatured: false,
          createdBy: adminExists ? adminExists._id : null
        },
        {
          name: 'Summer Dress',
          description: 'Light and airy summer dress perfect for warm weather',
          price: 2800,
          category: 'dresses',
          brand: 'ClothingStore',
          sizes: [
            { size: 'XS', quantity: 5 },
            { size: 'S', quantity: 10 },
            { size: 'M', quantity: 12 },
            { size: 'L', quantity: 8 },
            { size: 'XL', quantity: 3 }
          ],
          colors: [
            { color: 'Floral Print', colorCode: '#FF69B4' },
            { color: 'Solid Blue', colorCode: '#4169E1' },
            { color: 'White', colorCode: '#FFFFFF' }
          ],
          images: [{
            data: '/uploads/sample-dress.jpg',
            contentType: 'image/jpeg',
            alt: 'Summer Dress',
            isPrimary: true
          }],
          material: '100% Rayon',
          careInstructions: 'Hand wash cold, hang dry',
          tags: ['summer', 'casual', 'dress'],
          isActive: true,
          isFeatured: true,
          createdBy: adminExists ? adminExists._id : null
        }
      ];

      // Create admin user first if not exists for product creation
      let adminId = adminExists ? adminExists._id : null;
      if (!adminId) {
        const newAdmin = new User({
          name: 'Admin User',
          email: 'admin@clothingstore.com',
          password: 'YourNewPassword123',
          role: 'admin'
        });
        const savedAdmin = await newAdmin.save();
        adminId = savedAdmin._id;
      }

      // Update createdBy field
      sampleProducts.forEach(product => {
        product.createdBy = adminId;
      });

      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products created');
    } else {
      console.log('🛍️ Products already exist in database');
    }

    console.log('🎉 Database initialization complete!');
    console.log('📊 Database Statistics:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`🛍️ Products: ${await Product.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run initialization
initializeDatabase();
