const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['shirts', 'pants', 'dresses', 'jackets', 'shoes', 'accessories', 'underwear', 'sportswear']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  sizes: [{
    size: String,
    quantity: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  colors: [{
    color: String,
    colorCode: String
  }],
  images: [{
    data: String, // Base64 encoded image data
    contentType: String, // MIME type (image/jpeg, image/png, etc.)
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  material: String,
  careInstructions: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for total quantity
productSchema.virtual('totalQuantity').get(function() {
  return this.sizes.reduce((total, size) => total + size.quantity, 0);
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Database Indexes for Performance Optimization
productSchema.index({ category: 1, isActive: 1 }); // Category filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
productSchema.index({ price: 1 }); // Price sorting
productSchema.index({ createdAt: -1 }); // Recent products
productSchema.index({ isFeatured: 1, isActive: 1 }); // Featured products
productSchema.index({ 'rating.average': -1 }); // Rating sorting
productSchema.index({ brand: 1, category: 1 }); // Brand + category filtering
productSchema.index({ createdBy: 1 }); // Admin product queries

// Compound index for complex queries
productSchema.index({ 
  category: 1, 
  isActive: 1, 
  price: 1, 
  'rating.average': -1 
});

// Include virtuals when converting to JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
