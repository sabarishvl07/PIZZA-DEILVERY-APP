const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 10
  },
  price: {
    type: Number,
    required: true,
    default: 0 // extra price for custom pizza builder
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
