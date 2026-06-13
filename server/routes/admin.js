const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { protect, admin } = require('../middleware/authMiddleware');

// Apply protect & admin middleware to all routes in this router
router.use(protect, admin);

// @desc    Get all orders (newest first) with user details
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// @desc    Update order status and send real-time notification
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Emit live socket status update to the customer's specific socket room
    const io = req.app.get('io');
    if (io) {
      io.to(order.user._id.toString()).emit('order_status_updated', order);
      // Also emit a general update to any listening admin client
      io.emit('admin_order_updated', order);
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

// @desc    Get all inventory stock levels
// @route   GET /api/admin/inventory
// @access  Private/Admin
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ itemType: 1, name: 1 });
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Server error fetching inventory' });
  }
});

// @desc    Update stock level or threshold for a specific ingredient
// @route   PATCH /api/admin/inventory/:id
// @access  Private/Admin
router.patch('/inventory/:id', async (req, res) => {
  const { quantity, threshold, price, isAvailable } = req.body;

  try {
    const ingredient = await Inventory.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    if (quantity !== undefined) ingredient.quantity = quantity;
    if (threshold !== undefined) ingredient.threshold = threshold;
    if (price !== undefined) ingredient.price = price;
    if (isAvailable !== undefined) ingredient.isAvailable = isAvailable;

    await ingredient.save();

    // Emit socket update for real-time stock UI sync
    const io = req.app.get('io');
    if (io) {
      io.emit('stock_updated', ingredient);
    }

    res.json({ message: 'Stock item updated successfully', ingredient });
  } catch (error) {
    console.error('Error updating stock item:', error);
    res.status(500).json({ error: 'Server error updating stock item' });
  }
});

// @desc    Get dashboard metrics (total revenue, total orders, low stock items count)
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalSales : 0;

    // Check low stock count
    // Find how many inventory items have quantity <= threshold
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    });

    const activeOrders = await Order.countDocuments({
      status: { $in: ['Order Received', 'In the Kitchen', 'Sent to Delivery'] }
    });

    res.json({
      totalOrders,
      totalRevenue,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map(item => ({ name: item.name, quantity: item.quantity, threshold: item.threshold })),
      activeOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

module.exports = router;
