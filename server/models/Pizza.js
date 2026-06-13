const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Veg', 'Non-Veg'],
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pizza', pizzaSchema);
