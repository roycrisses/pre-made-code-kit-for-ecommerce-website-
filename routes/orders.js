const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart - use lean() for performance
    const cart = await Cart.findOne({ userId: req.user.id })
      .select('items totalAmount')
      .lean();
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate cart items and check stock - batch query for performance
    const productIds = cart.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name isActive sizes')
      .lean();
    
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    
    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }
      
      const sizeInfo = product.sizes.find(s => s.size === item.size);
      if (!sizeInfo || sizeInfo.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name} in size ${item.size}` 
        });
      }
    }

    // Create order items from cart
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: item.image
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 2000 ? 0 : 100; // Free shipping over Rs. 2000
    const totalAmount = subtotal + shippingCost;

    // Create order
    const orderData = {
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      totalAmount,
      notes: notes || ''
    };

    const order = new Order(orderData);
    await order.save();

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
      if (sizeIndex > -1) {
        product.sizes[sizeIndex].quantity -= item.quantity;
        await product.save();
      }
    }

    // Clear cart
    cart.clearCart();
    await cart.save();
    await Cart.update(cart.id, cart);

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const limit = 10;
    const orders = await Order.find({ userId: req.user.id })
      .select('items shippingAddress paymentMethod paymentStatus orderStatus totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/all', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    
    const filters = {};
    if (status) filters.orderStatus = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    let orderQuery = Order.find(filters);
    
    const orders = await orderQuery
      .select('userId items shippingAddress paymentMethod paymentStatus orderStatus totalAmount createdAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Use aggregation for count to leverage indexes
    const [{ total = 0 } = {}] = await Order.aggregate([
      { $match: filters },
      { $count: 'total' }
    ]);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', [auth, adminAuth], async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    const updatedOrder = await Order.update(req.params.id, order);
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus, esewaTransactionId } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (esewaTransactionId) order.esewaTransactionId = esewaTransactionId;

    // If payment is successful, update order status
    if (paymentStatus === 'paid' && order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
    }

    const updatedOrder = await Order.update(req.params.id, order);
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].quantity += item.quantity;
          await Product.update(product.id, product);
        }
      }
    }

    order.orderStatus = 'cancelled';
    await Order.update(req.params.id, order);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
