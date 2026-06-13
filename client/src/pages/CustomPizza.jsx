import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ChevronRight, ChevronLeft, ShoppingCart, Check, AlertCircle } from 'lucide-react';

const CustomPizza = () => {
  const [ingredients, setIngredients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pizza Configuration State
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [selectedMeats, setSelectedMeats] = useState([]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await axios.get('/api/pizzas/ingredients');
        setIngredients(res.data);
        
        // Auto-select first available items by default
        if (res.data.base?.length > 0) {
          const defaultBase = res.data.base.find(b => b.quantity > 0) || res.data.base[0];
          setSelectedBase(defaultBase);
        }
        if (res.data.sauce?.length > 0) {
          const defaultSauce = res.data.sauce.find(s => s.quantity > 0) || res.data.sauce[0];
          setSelectedSauce(defaultSauce);
        }
        if (res.data.cheese?.length > 0) {
          const defaultCheese = res.data.cheese.find(c => c.quantity > 0) || res.data.cheese[0];
          setSelectedCheese(defaultCheese);
        }
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setError('Failed to load ingredients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // Calculate price dynamically
  const basePrice = 149; // starting custom price
  const ingredientsPrice = 
    (selectedBase?.price || 0) +
    (selectedSauce?.price || 0) +
    (selectedCheese?.price || 0) +
    selectedVeggies.reduce((sum, item) => sum + item.price, 0) +
    selectedMeats.reduce((sum, item) => sum + item.price, 0);

  const singlePizzaPrice = basePrice + ingredientsPrice;
  const totalPrice = singlePizzaPrice * quantity;

  const steps = [
    { num: 1, name: 'Crust Base' },
    { num: 2, name: 'Sauce' },
    { num: 3, name: 'Cheese' },
    { num: 4, name: 'Veggies' },
    { num: 5, name: 'Meats' },
    { num: 6, name: 'Review & Order' }
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const toggleVeggie = (veggie) => {
    setSelectedVeggies(prev => {
      const exists = prev.find(v => v._id === veggie._id);
      if (exists) {
        return prev.filter(v => v._id !== veggie._id);
      } else {
        return [...prev, veggie];
      }
    });
  };

  const toggleMeat = (meat) => {
    setSelectedMeats(prev => {
      const exists = prev.find(m => m._id === meat._id);
      if (exists) {
        return prev.filter(m => m._id !== meat._id);
      } else {
        return [...prev, meat];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      alert('Please complete all selection steps.');
      return;
    }

    addToCart({
      name: 'Custom Pizza',
      isCustom: true,
      customDetails: {
        base: selectedBase.name,
        sauce: selectedSauce.name,
        cheese: selectedCheese.name,
        veggies: selectedVeggies.map(v => v.name),
        meat: selectedMeats.map(m => m.name)
      },
      price: singlePizzaPrice,
      quantity: quantity
    });

    setIsAdded(true);
    setTimeout(() => {
      navigate('/checkout');
    }, 1200);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading custom pizza builder configurations...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-accent)' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        🍕 Build Your <span className="gradient-text">Custom Pizza</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem' }}>
        Choose your crust, signature sauce, cheese type, and pile on the toppings!
      </p>

      {/* Stepper progress bar */}
      <div className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '2.5rem',
        alignItems: 'center',
        position: 'relative'
      }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            {/* Step circle */}
            <div 
              onClick={() => setCurrentStep(step.num)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 2,
                opacity: currentStep === step.num ? 1 : 0.6
              }}
            >
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: currentStep >= step.num ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                border: currentStep === step.num ? '2px solid var(--color-secondary)' : 'none',
                boxShadow: currentStep === step.num ? '0 0 12px var(--color-primary)' : 'none',
                transition: 'var(--transition-fast)'
              }}>
                {currentStep > step.num ? <Check size={16} /> : step.num}
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>{step.name}</span>
            </div>
            
            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div style={{
                flexGrow: 1,
                height: '3px',
                background: currentStep > step.num ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                margin: '0 1rem',
                transform: 'translateY(-10px)',
                transition: 'var(--transition-normal)'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* WIZARD CARD PANEL */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          
          {/* STEP 1: BASES */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Step 1: Choose Your Pizza Base</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ingredients.base?.map(item => {
                  const outOfStock = item.quantity === 0;
                  const isSelected = selectedBase?._id === item._id;

                  return (
                    <div 
                      key={item._id}
                      onClick={() => !outOfStock && setSelectedBase(item)}
                      style={{
                        padding: '1.25rem',
                        background: isSelected ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.4 : 1,
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.name}
                          {outOfStock && <span style={{ fontSize: '0.7rem', background: 'var(--color-accent)', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#fff' }}>Sold Out</span>}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required Stock: {item.quantity} left</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: item.price > 0 ? 'var(--color-secondary)' : 'var(--text-secondary)' }}>
                          {item.price > 0 ? `+ ₹${item.price}` : 'Free'}
                        </span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: isSelected ? 'var(--color-primary)' : 'var(--text-muted)'
                        }}>
                          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SAUCES */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Step 2: Choose Signature Sauce</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ingredients.sauce?.map(item => {
                  const outOfStock = item.quantity === 0;
                  const isSelected = selectedSauce?._id === item._id;

                  return (
                    <div 
                      key={item._id}
                      onClick={() => !outOfStock && setSelectedSauce(item)}
                      style={{
                        padding: '1.25rem',
                        background: isSelected ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.4 : 1,
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.name}
                          {outOfStock && <span style={{ fontSize: '0.7rem', background: 'var(--color-accent)', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#fff' }}>Sold Out</span>}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required Stock: {item.quantity} left</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: item.price > 0 ? 'var(--color-secondary)' : 'var(--text-secondary)' }}>
                          {item.price > 0 ? `+ ₹${item.price}` : 'Free'}
                        </span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: isSelected ? 'var(--color-primary)' : 'var(--text-muted)'
                        }}>
                          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESE */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Step 3: Choose Cheese Option</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ingredients.cheese?.map(item => {
                  const outOfStock = item.quantity === 0;
                  const isSelected = selectedCheese?._id === item._id;

                  return (
                    <div 
                      key={item._id}
                      onClick={() => !outOfStock && setSelectedCheese(item)}
                      style={{
                        padding: '1.25rem',
                        background: isSelected ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.4 : 1,
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.name}
                          {outOfStock && <span style={{ fontSize: '0.7rem', background: 'var(--color-accent)', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#fff' }}>Sold Out</span>}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required Stock: {item.quantity} left</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: item.price > 0 ? 'var(--color-secondary)' : 'var(--text-secondary)' }}>
                          {item.price > 0 ? `+ ₹${item.price}` : 'Free'}
                        </span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: isSelected ? 'var(--color-primary)' : 'var(--text-muted)'
                        }}>
                          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: VEGGIES */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 4: Load Fresh Veggies</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Select as many as you like. Additional charge applies per topping.</p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {ingredients.veggie?.map(item => {
                  const outOfStock = item.quantity === 0;
                  const isSelected = selectedVeggies.some(v => v._id === item._id);

                  return (
                    <div
                      key={item._id}
                      onClick={() => !outOfStock && toggleVeggie(item)}
                      style={{
                        padding: '1rem',
                        background: isSelected ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.4 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.name}
                          {outOfStock && <span style={{ fontSize: '0.6rem', background: 'var(--color-accent)', padding: '0.1rem 0.3rem', borderRadius: '2px', color: '#fff' }}>Sold Out</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} • {item.quantity} left</span>
                      </div>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '2px solid var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                        background: isSelected ? 'var(--color-primary)' : 'none'
                      }}>
                        {isSelected && <Check size={12} color="#ffffff" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: MEATS */}
          {currentStep === 5 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 5: Add Premium Meats</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Additional charge applies per meat topping.</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem'
              }}>
                {ingredients.meat?.map(item => {
                  const outOfStock = item.quantity === 0;
                  const isSelected = selectedMeats.some(m => m._id === item._id);

                  return (
                    <div
                      key={item._id}
                      onClick={() => !outOfStock && toggleMeat(item)}
                      style={{
                        padding: '1.25rem 1rem',
                        background: isSelected ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.4 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.name}
                          {outOfStock && <span style={{ fontSize: '0.6rem', background: 'var(--color-accent)', padding: '0.1rem 0.3rem', borderRadius: '2px', color: '#fff' }}>Sold Out</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} • {item.quantity} left</span>
                      </div>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '2px solid var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                        background: isSelected ? 'var(--color-primary)' : 'none'
                      }}>
                        {isSelected && <Check size={12} color="#ffffff" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {currentStep === 6 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', textAlign: 'center' }}>Step 6: Review Custom Pizza Configuration</h2>
              
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Crust Base</h5>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedBase?.name}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>+ ₹{selectedBase?.price || 0}</span>
                  </div>
                  
                  <div>
                    <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Signature Sauce</h5>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedSauce?.name}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>+ ₹{selectedSauce?.price || 0}</span>
                  </div>

                  <div>
                    <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cheese Style</h5>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedCheese?.name}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>+ ₹{selectedCheese?.price || 0}</span>
                  </div>

                  <div>
                    <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Quantity</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>-</button>
                      <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', marginBottom: '1rem' }}>
                  <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Selected Veggie Toppings</h5>
                  {selectedVeggies.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No veggies selected</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedVeggies.map(v => (
                        <span key={v._id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
                          {v.name} (+₹{v.price})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
                  <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Selected Meat Toppings</h5>
                  {selectedMeats.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No meats selected</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedMeats.map(m => (
                        <span key={m._id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
                          {m.name} (+₹{m.price})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  background: isAdded ? 'var(--color-primary)' : 'linear-gradient(135deg, #00c853, #00b0ff)'
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={20} /> Added to Cart! Redirecting...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Add to Cart & Checkout (₹{totalPrice})
                  </>
                )}
              </button>
            </div>
          )}

          {/* NEXT / PREVIOUS CONTROL BUTTONS */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem',
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '1.5rem'
          }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.2rem' }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : null}
          </div>

        </div>

        {/* SIDE SUMMARY CARD */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            Pizza Builder Invoice
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Base Price</span>
              <span>₹149</span>
            </div>
            
            {selectedBase && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Crust ({selectedBase.name})</span>
                <span>+ ₹{selectedBase.price}</span>
              </div>
            )}

            {selectedSauce && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sauce ({selectedSauce.name})</span>
                <span>+ ₹{selectedSauce.price}</span>
              </div>
            )}

            {selectedCheese && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cheese ({selectedCheese.name})</span>
                <span>+ ₹{selectedCheese.price}</span>
              </div>
            )}

            {selectedVeggies.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Veg Toppings ({selectedVeggies.length})</span>
                <span>+ ₹{selectedVeggies.reduce((s, i) => s + i.price, 0)}</span>
              </div>
            )}

            {selectedMeats.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Meat Toppings ({selectedMeats.length})</span>
                <span>+ ₹{selectedMeats.reduce((s, i) => s + i.price, 0)}</span>
              </div>
            )}
          </div>

          <div style={{
            borderTop: '2px dashed var(--border-glass)',
            paddingTop: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <span style={{ fontWeight: 'bold' }}>Total Cost</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)' }}>₹{totalPrice}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{singlePizzaPrice} x {quantity} unit(s)</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 179, 0, 0.05)',
            border: '1px solid rgba(255, 179, 0, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            display: 'flex',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <AlertCircle size={28} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
            <div>
              Custom builder orders auto-verify ingredient stock prior to checkout. Make adjustments to toppings to match stock warnings.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CustomPizza;
