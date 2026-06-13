require('dotenv').config();
const mongoose = require('mongoose');
const Pizza = require('./models/Pizza');
const Inventory = require('./models/Inventory');

const pizzas = [
  {
    name: 'Classic Margherita',
    description: 'Classic delight with 100% real mozzarella cheese on signature marinara base.',
    category: 'Veg',
    basePrice: 199,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Farmhouse Delight',
    description: 'Delightful combination of red onion, green bell peppers, juicy tomatoes, and sliced mushrooms.',
    category: 'Veg',
    basePrice: 299,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'BBQ Chicken Supreme',
    description: 'Grilled BBQ chicken breast, sliced red onions, and mozzarella on zesty barbecue sauce.',
    category: 'Non-Veg',
    basePrice: 349,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Double Pepperoni Feast',
    description: 'Loaded with double layers of smoked pepperoni and extra mozzarella cheese.',
    category: 'Non-Veg',
    basePrice: 399,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Veggie Garden Supreme',
    description: 'Healthy mix of black olives, sweet corn, baby spinach, bell peppers, and red onion.',
    category: 'Veg',
    basePrice: 329,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=60'
  }
];

const ingredients = [
  // Bases
  { itemType: 'base', name: 'Thin Crust', quantity: 50, threshold: 20, price: 0 },
  { itemType: 'base', name: 'Thick Crust', quantity: 50, threshold: 20, price: 20 },
  { itemType: 'base', name: 'Cheesy Burst', quantity: 50, threshold: 20, price: 50 },
  { itemType: 'base', name: 'Gluten-Free Crust', quantity: 30, threshold: 10, price: 40 },
  { itemType: 'base', name: 'Whole Wheat Flatbread', quantity: 40, threshold: 15, price: 10 },

  // Sauces
  { itemType: 'sauce', name: 'Classic Marinara', quantity: 80, threshold: 25, price: 0 },
  { itemType: 'sauce', name: 'Spicy BBQ Sauce', quantity: 60, threshold: 20, price: 10 },
  { itemType: 'sauce', name: 'Creamy Alfredo', quantity: 60, threshold: 20, price: 15 },
  { itemType: 'sauce', name: 'Basil Pesto', quantity: 50, threshold: 15, price: 20 },
  { itemType: 'sauce', name: 'Buffalo Hot Sauce', quantity: 50, threshold: 15, price: 10 },

  // Cheeses
  { itemType: 'cheese', name: 'Mozzarella Cheese', quantity: 100, threshold: 30, price: 0 },
  { itemType: 'cheese', name: 'Sharp Cheddar', quantity: 80, threshold: 20, price: 20 },
  { itemType: 'cheese', name: 'Shaved Parmesan', quantity: 70, threshold: 15, price: 25 },
  { itemType: 'cheese', name: 'Vegan Cheese', quantity: 50, threshold: 15, price: 30 },
  { itemType: 'cheese', name: 'No Extra Cheese', quantity: 9999, threshold: 0, price: 0 },

  // Veggies
  { itemType: 'veggie', name: 'Button Mushrooms', quantity: 60, threshold: 15, price: 15 },
  { itemType: 'veggie', name: 'Bell Peppers', quantity: 70, threshold: 20, price: 10 },
  { itemType: 'veggie', name: 'Red Onions', quantity: 80, threshold: 25, price: 10 },
  { itemType: 'veggie', name: 'Black Olives', quantity: 50, threshold: 15, price: 15 },
  { itemType: 'veggie', name: 'Sweet Corn', quantity: 60, threshold: 15, price: 12 },
  { itemType: 'veggie', name: 'Pickled Jalapeños', quantity: 50, threshold: 15, price: 15 },
  { itemType: 'veggie', name: 'Baby Spinach', quantity: 40, threshold: 10, price: 15 },
  { itemType: 'veggie', name: 'Cherry Tomatoes', quantity: 50, threshold: 15, price: 12 },

  // Meats
  { itemType: 'meat', name: 'Smoked Pepperoni', quantity: 60, threshold: 20, price: 40 },
  { itemType: 'meat', name: 'Grilled Chicken Chunks', quantity: 60, threshold: 20, price: 35 },
  { itemType: 'meat', name: 'Crisp Bacon Bits', quantity: 40, threshold: 15, price: 45 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing
    await Pizza.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleaned old Pizza & Inventory collections');

    // Insert new
    await Pizza.insertMany(pizzas);
    console.log('Successfully seeded pizzas');

    await Inventory.insertMany(ingredients);
    console.log('Successfully seeded inventory ingredients');

    mongoose.connection.close();
    console.log('Database connection closed. Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
