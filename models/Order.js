const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
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
    min: 1
  },
  size: String,
  color: String,
  image: String
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Nepal' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['esewa', 'cod']
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'refunded']
  },
  orderStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 100,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  esewaTransactionId: String,
  trackingNumber: String,
  notes: String
}, {
  timestamps: true
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.totalAmount = this.subtotal + this.shippingCost;
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(orderStatus, paymentStatus = null) {
  if (orderStatus) {
    this.orderStatus = orderStatus;
  }
  
  if (paymentStatus) {
    this.paymentStatus = paymentStatus;
  }
};

// Database Indexes for Performance Optimization
orderSchema.index({ userId: 1, createdAt: -1 }); // User order history
orderSchema.index({ orderStatus: 1, createdAt: -1 }); // Status filtering
orderSchema.index({ paymentStatus: 1 }); // Payment queries
orderSchema.index({ 'items.productId': 1 }); // Product references
orderSchema.index({ esewaTransactionId: 1 }); // Payment tracking
orderSchema.index({ trackingNumber: 1 }); // Shipment tracking

// Compound index for admin queries
orderSchema.index({ 
  orderStatus: 1, 
  paymentStatus: 1, 
  createdAt: -1 
});

module.exports = mongoose.model('Order', orderSchema);
