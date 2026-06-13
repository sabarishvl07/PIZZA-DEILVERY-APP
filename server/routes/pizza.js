const express = require('express');
const router = express.Router();
const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');

// @desc    Get all available standard pizzas
// @route   GET /api/pizzas
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pizzas = await Pizza.find({ isAvailable: true });
    res.json(pizzas);
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    res.status(500).json({ error: 'Server error fetching pizzas' });
  }
});

// @desc    Get all available ingredients for custom pizza building
// @route   GET /api/pizzas/ingredients
// @access  Public (or Private)
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await Inventory.find({ isAvailable: true });
    
    // Group ingredients by type for frontend ease-of-use
    const grouped = {
      base: ingredients.filter(i => i.itemType === 'base'),
      sauce: ingredients.filter(i => i.itemType === 'sauce'),
      cheese: ingredients.filter(i => i.itemType === 'cheese'),
      veggie: ingredients.filter(i => i.itemType === 'veggie'),
      meat: ingredients.filter(i => i.itemType === 'meat')
    };

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Server error fetching ingredients' });
  }
});

module.exports = router;
