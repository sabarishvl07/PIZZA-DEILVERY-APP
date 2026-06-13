const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza',
      required: false
    },
    name: {
      type: String,
      required: true
    },
    isCustom: {
      type: Boolean,
      default: false
    },
    customDetails: {
      base: String,
      sauce: String,
      cheese: String,
      veggies: [String],
      meat: [String]
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: false
  },
  paymentOrderId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'],
    default: 'Order Received'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
