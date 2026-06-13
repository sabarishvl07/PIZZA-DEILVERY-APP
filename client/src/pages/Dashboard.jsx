import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ChefHat, ShoppingCart, Plus, Minus, Check, Eye } from 'lucide-react';

const Dashboard = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({}); // key: pizzaId, value: number
  const [addedPopups, setAddedPopups] = useState({}); // key: pizzaId, value: boolean
  const [activeOrder, setActiveOrder] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pizzas
        const resPizzas = await axios.get('/api/pizzas');
        setPizzas(resPizzas.data);

        // Initialize quantities
        const qData = {};
        resPizzas.data.forEach(p => {
          qData[p._id] = 1;
        });
        setQuantities(qData);

        // Fetch user orders to check for active tracker
        const resOrders = await axios.get('/api/orders/my-orders');
        const active = resOrders.data.find(o => o.status !== 'Delivered');
        if (active) {
          setActiveOrder(active);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load menu items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQtyChange = (pizzaId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [pizzaId]: Math.max(1, (prev[pizzaId] || 1) + delta)
    }));
  };

  const handleAddToCart = (pizza) => {
    const qty = quantities[pizza._id] || 1;
    
    addToCart({
      pizzaId: pizza._id,
      pizza: pizza._id,
      name: pizza.name,
      isCustom: false,
      price: pizza.basePrice,
      quantity: qty
    });

    // Show temporary success popup/toast on the card
    setAddedPopups(prev => ({ ...prev, [pizza._id]: true }));
    setTimeout(() => {
      setAddedPopups(prev => ({ ...prev, [pizza._id]: false }));
    }, 2000);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Active Order Banner Widget */}
      {activeOrder && (
        <div className="glass-panel animate-fade-in animate-pulse" style={{
          padding: '1.25rem 2rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--color-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ color: 'var(--color-secondary)', fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🍕 Active Order in Progress!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Order #{activeOrder._id} status: <strong>{activeOrder.status}</strong>
            </p>
          </div>
          <Link to={`/orders`} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} /> Track Status
          </Link>
        </div>
      )}

      {/* Banner */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '3rem 2rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.15) 0%, rgba(0, 176, 255, 0.05) 100%)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.75rem', fontWeight: 800 }}>
          Craft Your Perfect <span className="gradient-text">Pizza</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '2rem', lineHeight: '1.6' }}>
          Select from our chef-crafted signature recipes, or build your own from scratch choosing your custom crust, sauces, cheeses, and fresh toppings!
        </p>
        <Link to="/build-pizza" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', gap: '0.75rem' }}>
          <ChefHat size={20} />
          Create Custom Pizza Builder
        </Link>
      </div>

      {/* Grid Menu Title */}
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        Signature Pizzas
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading menu items...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-accent)' }}>
          {error}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {pizzas.map((pizza) => {
            const isVeg = pizza.category === 'Veg';
            const isAdded = addedPopups[pizza._id];
            
            return (
              <div key={pizza._id} className="glass-card animate-fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '0',
                borderRadius: 'var(--radius-md)'
              }}>
                {/* Pizza Image container */}
                <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={pizza.image} 
                    alt={pizza.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  {/* Category Tag */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: isVeg ? 'rgba(0, 200, 83, 0.9)' : 'rgba(255, 61, 0, 0.9)',
                    color: '#ffffff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {pizza.category}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{pizza.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '1.5rem' }}>
                    {pizza.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffffff' }}>₹{pizza.basePrice}</div>
                    </div>

                    {/* Quantity selectors */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', padding: '0.25rem 0.5rem' }}>
                      <button 
                        onClick={() => handleQtyChange(pizza._id, -1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: '15px', textAlign: 'center' }}>
                        {quantities[pizza._id] || 1}
                      </span>
                      <button 
                        onClick={() => handleQtyChange(pizza._id, 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <button 
                    onClick={() => handleAddToCart(pizza)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '1.25rem',
                      background: isAdded ? 'var(--color-primary)' : 'linear-gradient(135deg, #00c853, #00b0ff)',
                      boxShadow: isAdded ? '0 4px 14px rgba(0,200,83,0.4)' : 'var(--shadow-sm)'
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
