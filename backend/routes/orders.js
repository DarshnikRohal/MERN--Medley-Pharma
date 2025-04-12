const express = require('express');
const router = express.Router();
const STRIPE_SECRET_KEY="Rohal";
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: 'usd'
    });

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      paymentId: paymentIntent.id
    });

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Handle Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await Order.findOneAndUpdate(
        { paymentId: paymentIntent.id },
        { paymentStatus: 'completed' }
      );
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
