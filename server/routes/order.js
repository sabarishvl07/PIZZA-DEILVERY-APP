const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Pizza = require('../models/Pizza');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/mailer');

// Helper mapping standard pizza names to their ingredient names in the inventory
const getIngredientsForPizza = (pizzaName, isCustom, customDetails) => {
  if (isCustom && customDetails) {
    const list = [];
    if (customDetails.base) list.push({ name: customDetails.base, type: 'base' });
    if (customDetails.sauce) list.push({ name: customDetails.sauce, type: 'sauce' });
    if (customDetails.cheese) list.push({ name: customDetails.cheese, type: 'cheese' });
    if (customDetails.veggies && Array.isArray(customDetails.veggies)) {
      customDetails.veggies.forEach(v => list.push({ name: v, type: 'veggie' }));
    }
    if (customDetails.meat && Array.isArray(customDetails.meat)) {
      customDetails.meat.forEach(m => list.push({ name: m, type: 'meat' }));
    }
    return list;
  }

  // Pre-configured mappings for standard pizzas
  const mapping = {
    'Classic Margherita': [
      { name: 'Thin Crust', type: 'base' },
      { name: 'Classic Marinara', type: 'sauce' },
      { name: 'Mozzarella Cheese', type: 'cheese' }
    ],
    'Farmhouse Delight': [
      { name: 'Thin Crust', type: 'base' },
      { name: 'Classic Marinara', type: 'sauce' },
      { name: 'Mozzarella Cheese', type: 'cheese' },
      { name: 'Button Mushrooms', type: 'veggie' },
      { name: 'Bell Peppers', type: 'veggie' },
      { name: 'Red Onions', type: 'veggie' },
      { name: 'Cherry Tomatoes', type: 'veggie' }
    ],
    'BBQ Chicken Supreme': [
      { name: 'Thick Crust', type: 'base' },
      { name: 'Spicy BBQ Sauce', type: 'sauce' },
      { name: 'Mozzarella Cheese', type: 'cheese' },
      { name: 'Grilled Chicken Chunks', type: 'meat' },
      { name: 'Red Onions', type: 'veggie' }
    ],
    'Double Pepperoni Feast': [
      { name: 'Cheesy Burst', type: 'base' },
      { name: 'Classic Marinara', type: 'sauce' },
      { name: 'Mozzarella Cheese', type: 'cheese' },
      { name: 'Smoked Pepperoni', type: 'meat' }
    ],
    'Veggie Garden Supreme': [
      { name: 'Gluten-Free Crust', type: 'base' },
      { name: 'Basil Pesto', type: 'sauce' },
      { name: 'Vegan Cheese', type: 'cheese' },
      { name: 'Black Olives', type: 'veggie' },
      { name: 'Sweet Corn', type: 'veggie' },
      { name: 'Baby Spinach', type: 'veggie' },
      { name: 'Bell Peppers', type: 'veggie' },
      { name: 'Red Onions', type: 'veggie' }
    ]
  };

  return mapping[pizzaName] || [];
};

// @desc    Place a new order (requires payment confirmation details)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { items, totalAmount, paymentOrderId, paymentId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!paymentOrderId || !paymentId) {
    return res.status(400).json({ error: 'Payment information missing' });
  }

  try {
    // 1. Calculate required ingredients and verify stock availability
    const requiredStock = {}; // key: name, value: count needed

    for (const item of items) {
      const ingredientList = getIngredientsForPizza(item.name, item.isCustom, item.customDetails);
      const qty = item.quantity || 1;

      for (const ingredient of ingredientList) {
        if (!requiredStock[ingredient.name]) {
          requiredStock[ingredient.name] = 0;
        }
        requiredStock[ingredient.name] += qty;
      }
    }

    // Check availability in db
    const ingredientNames = Object.keys(requiredStock);
    const stockItems = await Inventory.find({ name: { $in: ingredientNames } });

    // Validate that all items exist and have sufficient stock
    for (const name of ingredientNames) {
      const stockItem = stockItems.find(i => i.name === name);
      if (!stockItem) {
        return res.status(400).json({ error: `Ingredient "${name}" is not available in our system.` });
      }
      if (stockItem.quantity < requiredStock[name]) {
        return res.status(400).json({ error: `Sorry, we are out of stock for "${name}".` });
      }
    }

    // 2. Deduct quantities in DB
    const lowStockAlerts = [];
    for (const name of ingredientNames) {
      const countNeeded = requiredStock[name];
      const updatedItem = await Inventory.findOneAndUpdate(
        { name },
        { $inc: { quantity: -countNeeded } },
        { new: true }
      );

      // Check if stock has dropped below threshold
      if (updatedItem.quantity <= updatedItem.threshold) {
        lowStockAlerts.push(updatedItem);
      }
    }

    // 3. Create the Order
    const order = await Order.create({
      user: req.user._id,
      items: items.map(i => ({
        pizza: i.pizza,
        name: i.name,
        isCustom: i.isCustom,
        customDetails: i.customDetails,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount,
      paymentOrderId,
      paymentId,
      paymentStatus: 'Paid',
      status: 'Order Received'
    });

    // 4. Send low stock email if threshold breached
    if (lowStockAlerts.length > 0) {
      const admins = await User.find({ role: 'admin' });
      const adminEmails = admins.map(a => a.email);
      // Fallback to configured email user if no admins found
      if (adminEmails.length === 0) {
        adminEmails.push(process.env.EMAIL_USER);
      }

      const alertListHtml = lowStockAlerts
        .map(item => `<li><strong>${item.name}</strong>: Current stock is ${item.quantity} (Threshold: ${item.threshold})</li>`)
        .join('');

      const emailHtml = `
        <h2>⚠️ LOW STOCK INVENTORY ALERT</h2>
        <p>The following pizza ingredients have fallen below their safety threshold levels after Order #${order._id}:</p>
        <ul>
          ${alertListHtml}
        </ul>
        <p>Please log in to the admin panel to update stock levels.</p>
      `;

      await sendEmail({
        to: adminEmails.join(','),
        subject: '⚠️ Pizza Delivery App: Low Stock Alert',
        html: emailHtml
      });
    }

    // 5. Emit socket event for real-time update in Admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', order);
      io.emit('stock_updated');
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Server error, could not process order.' });
  }
});

// @desc    Get current user's order history
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// @desc    Get details of a single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Allow user who made the order, or an admin to access
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});

module.exports = router;
