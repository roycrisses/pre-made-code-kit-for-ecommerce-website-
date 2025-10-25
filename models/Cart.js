const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: String,
  color: String,
  image: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productData) {
  const { productId, productName, price, quantity = 1, size = '', color = '', image = '' } = productData;
  
  const existingItemIndex = this.items.findIndex(item => 
    item.productId.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      productId,
      productName,
      price,
      quantity,
      size,
      color,
      image
    });
  }
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, size, color, quantity) {
  const itemIndex = this.items.findIndex(item => 
    item.productId.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    return true;
  }
  return false;
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, size = '', color = '') {
  const itemIndex = this.items.findIndex(item => 
    item.productId.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return true;
  }
  return false;
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalAmount = 0;
};

// Database Indexes for Performance Optimization
cartSchema.index({ userId: 1 }); // User cart lookup
cartSchema.index({ 'items.productId': 1 }); // Product references
cartSchema.index({ updatedAt: -1 }); // Recent activity

module.exports = mongoose.model('Cart', cartSchema);
