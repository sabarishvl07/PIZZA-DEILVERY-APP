import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ChevronLeft, ShieldCheck, HelpCircle } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const deliveryFee = cart.length > 0 ? 35 : 0;
  const taxRate = 0.05; // 5% GST
  const gstTax = Math.round(cartTotal * taxRate);
  const grandTotal = cartTotal + deliveryFee + gstTax;

  // Helper to dynamically load external scripts
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setError('');
    setLoading(true);

    // 1. Load Razorpay Checkout SDK
    const isScriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!isScriptLoaded) {
      setLoading(false);
      setError('Failed to load Razorpay payment SDK. Check your network connection.');
      return;
    }

    try {
      // 2. Create Razorpay order on backend
      const orderRes = await axios.post('/api/payment/create-order', { amount: grandTotal });
      const orderData = orderRes.data;

      // 3. Configure Razorpay checkout options
      // Note: We use a fallback test key if not defined on client
      const rawKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T0oqNdrzcSdAr8';
      const trimmedKey = rawKey.trim();
      console.log('Frontend Razorpay Key used:', trimmedKey.substring(0, 12) + '...', '[length:', trimmedKey.length, ']');

      const options = {
        key: trimmedKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PizzaCraft Store',
        description: 'Complete your pizza feast payment',
        image: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
            // 4. Verify payment on backend
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.status === 'success') {
              // 5. Submit actual order to DB
              const orderSubmission = await axios.post('/api/orders', {
                items: cart,
                totalAmount: grandTotal,
                paymentOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id
              });

              clearCart();
              navigate('/orders', { 
                state: { successMessage: 'Feast ordered successfully! Tracking order live.' } 
              });
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            console.error('Payment callback error:', err);
            setError(err.response?.data?.error || 'Order placement failed after payment.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#00c853',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error('Order checkout initialization failed:', err);
      setError(err.response?.data?.error || 'Could not initialize payment gateway.');
      setLoading(false);
    }
  };

  // Developer Bypass Payment logic for testing in case of invalid API credentials
  const handleBypassPayment = async () => {
    if (window.confirm('⚠️ Developer Tool: Would you like to bypass Razorpay payment authentication and simulate a successful order?')) {
      setLoading(true);
      setError('');
      try {
        const mockOrderId = `pay_bypass_${Date.now()}`;
        const mockPaymentId = `rzp_mock_${Math.random().toString(36).substring(2, 11)}`;

        const orderSubmission = await axios.post('/api/orders', {
          items: cart,
          totalAmount: grandTotal,
          paymentOrderId: mockOrderId,
          paymentId: mockPaymentId
        });

        clearCart();
        navigate('/orders', { 
          state: { successMessage: '⚡ Simulated bypass checkout successful!' } 
        });
      } catch (err) {
        console.error('Simulated order placement failed:', err);
        setError(err.response?.data?.error || 'Simulated checkout failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '3rem 1.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <ShoppingBag size={48} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
          Looks like you haven't added any pizzas to your feast yet! Head back to the dashboard to select signature recipes or craft a custom one.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Pizza Menu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} /> Continue Selection
        </Link>
      </div>

      <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Review Your Order</h1>

      {error && (
        <div style={{
          background: 'rgba(255, 61, 0, 0.1)',
          border: '1px solid rgba(255, 61, 0, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          color: '#ff8a80',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* CART ITEMS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cart.map((item) => (
            <div key={item.cartItemId} className="glass-panel" style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                
                {/* Custom toppings listing */}
                {item.isCustom && item.customDetails && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.4rem' }}>
                    <div><strong>Crust:</strong> {item.customDetails.base}</div>
                    <div><strong>Sauce:</strong> {item.customDetails.sauce}</div>
                    <div><strong>Cheese:</strong> {item.customDetails.cheese}</div>
                    {item.customDetails.veggies.length > 0 && (
                      <div><strong>Veggies:</strong> {item.customDetails.veggies.join(', ')}</div>
                    )}
                    {item.customDetails.meat.length > 0 && (
                      <div><strong>Meats:</strong> {item.customDetails.meat.join(', ')}</div>
                    )}
                  </div>
                )}
                
                {!item.isCustom && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'rgba(0,200,83,0.05)', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                    Signature Recipe
                  </span>
                )}
              </div>

              {/* Price and Quantities controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} each</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
                  <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.cartItemId)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY PANEL */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            Invoice Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Surcharge</span>
              <span>₹{deliveryFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>GST (5% tax)</span>
              <span>₹{gstTax}</span>
            </div>
          </div>

          <div style={{
            borderTop: '2px dashed var(--border-glass)',
            paddingTop: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Grand Total</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{grandTotal}</span>
          </div>

          <button 
            onClick={handlePayment} 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', gap: '0.5rem', marginBottom: '0.75rem' }}
          >
            <CreditCard size={18} /> {loading ? 'Processing Transaction...' : 'Pay with Razorpay Checkout'}
          </button>

          {/* Fallback mock testing button */}
          <button
            onClick={handleBypassPayment}
            disabled={loading}
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              padding: '0.6rem', 
              fontSize: '0.8rem', 
              borderColor: 'rgba(255, 171, 64, 0.4)', 
              color: 'var(--color-secondary)',
              background: 'rgba(255, 171, 64, 0.02)',
              marginTop: '0.5rem'
            }}
          >
            ⚡ Sandbox Mock Checkout (Bypass Keys)
          </button>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>Encrypted payment processing verified by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
