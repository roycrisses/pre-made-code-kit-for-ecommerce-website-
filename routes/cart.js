const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { cartCache, keys, invalidate } = require('../config/cache');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cacheKey = keys.cart(req.user.id);
    
    // Try to get from cache first
    const cachedCart = cartCache.get(cacheKey);
    if (cachedCart) {
      return res.json(cachedCart);
    }

    // Use lean() and select only needed fields for better performance
    let cart = await Cart.findOne({ userId: req.user.id })
      .select('items totalAmount updatedAt')
      .lean();
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
      await cart.save();
      return res.json(cart);
    }

    // Cache for 3 minutes
    cartCache.set(cacheKey, cart, 180);

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    // Validate product exists and has stock - use lean() for performance
    const product = await Product.findById(productId)
      .select('name price discount sizes colors images isActive')
      .lean();
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if size is available
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo || sizeInfo.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock for selected size' });
    }

    // Check if color is available
    const colorInfo = product.colors.find(c => c.color === color);
    if (!colorInfo) {
      return res.status(400).json({ message: 'Selected color not available' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
    }

    const price = product.discount > 0 ? product.discountedPrice : product.price;

    // Add item to cart using schema method
    const itemData = {
      productId: product._id,
      productName: product.name,
      quantity,
      size,
      color,
      price,
      image: product.images[0] || ''
    };

    cart.addItem(itemData);
    await cart.save();
    
    // Invalidate cache after update
    invalidate.cart(req.user.id);
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock availability - use lean() for performance
    const product = await Product.findById(item.productId)
      .select('sizes')
      .lean();
    const sizeInfo = product.sizes.find(s => s.size === item.size);
    
    if (sizeInfo.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();
    
    // Invalidate cache after update
    invalidate.cart(req.user.id);
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.id(req.params.itemId).remove();
    await cart.save();
    
    // Invalidate cache after update
    invalidate.cart(req.user.id);
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.clearCart();
    await cart.save();
    
    // Invalidate cache after update
    invalidate.cart(req.user.id);
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
