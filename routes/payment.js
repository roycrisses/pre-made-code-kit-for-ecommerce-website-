const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// eSewa configuration
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL;
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL;

// @route   POST /api/payment/esewa/initiate
// @desc    Initiate eSewa payment
// @access  Private
router.post('/esewa/initiate', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate signature for eSewa
    const message = `total_amount=${order.totalAmount},transaction_uuid=${order._id},product_code=${ESEWA_MERCHANT_ID}`;
    const signature = crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(message).digest('base64');

    const esewaPaymentData = {
      amount: order.totalAmount,
      failure_url: ESEWA_FAILURE_URL,
      product_delivery_charge: 0,
      product_service_charge: 0,
      product_code: ESEWA_MERCHANT_ID,
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: ESEWA_SUCCESS_URL,
      tax_amount: 0,
      total_amount: order.totalAmount,
      transaction_uuid: order._id
    };

    res.json({
      paymentUrl: 'https://uat.esewa.com.np/epay/main',
      paymentData: esewaPaymentData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/esewa/verify
// @desc    Verify eSewa payment
// @access  Private
router.post('/esewa/verify', auth, async (req, res) => {
  try {
    const { oid, amt, refId } = req.body;

    const order = await Order.findById(oid);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment with eSewa
    const verificationData = {
      amt: amt,
      rid: refId,
      pid: order._id,
      scd: ESEWA_MERCHANT_ID
    };

    try {
      const verificationResponse = await axios.post(
        'https://uat.esewa.com.np/epay/transrec',
        new URLSearchParams(verificationData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (verificationResponse.data.includes('Success')) {
        // Payment verified successfully
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.esewaTransactionId = refId;
        await order.save();

        res.json({
          success: true,
          message: 'Payment verified successfully',
          order: order
        });
      } else {
        // Payment verification failed
        order.paymentStatus = 'failed';
        await order.save();

        res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    } catch (verificationError) {
      console.error('eSewa verification error:', verificationError);
      res.status(500).json({
        success: false,
        message: 'Payment verification error'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/cod/confirm
// @desc    Confirm Cash on Delivery order
// @access  Private
router.post('/cod/confirm', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'This order is not Cash on Delivery' });
    }

    order.orderStatus = 'confirmed';
    await order.save();

    res.json({
      success: true,
      message: 'Cash on Delivery order confirmed',
      order: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
  res.json({
    methods: [
      {
        id: 'esewa',
        name: 'eSewa',
        description: 'Pay securely with eSewa digital wallet',
        icon: '/images/esewa-logo.png',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered',
        icon: '/images/cod-icon.png',
        enabled: true
      }
    ]
  });
});

module.exports = router;
