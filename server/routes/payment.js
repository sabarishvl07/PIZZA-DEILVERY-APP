const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');

// Initialize Razorpay instance
// In test mode, it works with keys starting with rzp_test_
console.log('Razorpay Init - Key ID:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.trim().substring(0, 12)}... [length: ${process.env.RAZORPAY_KEY_ID.length}]` : 'undefined');
console.log('Razorpay Init - Key Secret:', process.env.RAZORPAY_KEY_SECRET ? `...${process.env.RAZORPAY_KEY_SECRET.trim().slice(-4)} [length: ${process.env.RAZORPAY_KEY_SECRET.length}]` : 'undefined');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : undefined,
  key_secret: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : undefined
});

// @desc    Create a payment order with Razorpay
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid order amount' });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // convert rupees to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: 'Payment gateway error. Please try again.' });
  }
});

// @desc    Verify payment signature from Razorpay checkout
// @route   POST /api/payment/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.json({ status: 'success', message: 'Payment verified successfully.' });
    } else {
      return res.status(400).json({ status: 'failed', error: 'Payment signature mismatch.' });
    }
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification.' });
  }
});

module.exports = router;
