import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { ClipboardList, Clock, CheckCircle2, Truck, Sparkles, ChefHat } from 'lucide-react';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const { user } = useAuth();
  const location = useLocation();

  // Load orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Show success message from checkout redirect
    if (location.state?.successMessage) {
      setToastMessage(location.state.successMessage);
      // clear location state to avoid repeating toast on refresh
      window.history.replaceState({}, document.title);
      setTimeout(() => setToastMessage(''), 4000);
    }
  }, [location]);

  // Set up real-time Socket.IO connection
  useEffect(() => {
    if (!user) return;

    // Connect to backend socket server
    const socket = io('http://localhost:5000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to socket server for live order tracking');
      // Join user-specific socket channel
      socket.emit('join', user._id);
    });

    // Listen for status changes
    socket.on('order_status_updated', (updatedOrder) => {
      console.log('Received order status update via Socket:', updatedOrder);
      
      // Update local state list
      setOrders(prevOrders => 
        prevOrders.map(order => order._id === updatedOrder._id ? updatedOrder : order)
      );

      // Show temporary screen alert
      setToastMessage(`🎉 Order #${updatedOrder._id.substring(18)} status updated to "${updatedOrder.status}"!`);
      setTimeout(() => setToastMessage(''), 5000);
    });

    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, [user]);

  // Helper to map order status to numeric steps
  const getStatusStep = (status) => {
    const mapping = {
      'Order Received': 1,
      'In the Kitchen': 2,
      'Sent to Delivery': 3,
      'Delivered': 4
    };
    return mapping[status] || 1;
  };

  // Find if there is an active order
  const activeOrder = orders.find(o => o.status !== 'Delivered');

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Dynamic Screen Alert Toast */}
      {toastMessage && (
        <div className="glass-panel" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: 'rgba(0, 200, 83, 0.95)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderLeft: '5px solid var(--color-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.3s forwards'
        }}>
          <Sparkles size={20} color="var(--color-secondary)" className="pulse" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ClipboardList size={32} color="var(--color-primary)" />
        Track Your Orders
      </h1>

      {error && (
        <div style={{
          background: 'rgba(255, 61, 0, 0.1)',
          border: '1px solid rgba(255, 61, 0, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          color: '#ff8a80',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* ACTIVE ORDER LIVE STEPPER */}
      {activeOrder && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid rgba(0,200,83,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', background: 'rgba(255,179,0,0.05)', padding: '0.25rem 0.5rem', borderRadius: '3px', fontWeight: 'bold' }}>
                LIVE TRACKING
              </span>
              <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>Order #{activeOrder._id}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Placed on {new Date(activeOrder.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Current Status</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{activeOrder.status}</div>
            </div>
          </div>

          {/* Stepper visuals */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            marginTop: '3rem',
            padding: '0 1rem'
          }}>
            {/* Step 1: Placed */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: getStatusStep(activeOrder.status) >= 1 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: getStatusStep(activeOrder.status) === 1 ? '0 0 15px var(--color-primary)' : 'none'
              }}>
                <Clock size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Received</span>
            </div>

            {/* line 1 */}
            <div style={{
              flexGrow: 1,
              height: '4px',
              background: getStatusStep(activeOrder.status) >= 2 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
              margin: '0 0.5rem',
              transform: 'translateY(-12px)'
            }} />

            {/* Step 2: Preparing */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: getStatusStep(activeOrder.status) >= 2 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: getStatusStep(activeOrder.status) === 2 ? '0 0 15px var(--color-primary)' : 'none'
              }}>
                <ChefHat size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>In Kitchen</span>
            </div>

            {/* line 2 */}
            <div style={{
              flexGrow: 1,
              height: '4px',
              background: getStatusStep(activeOrder.status) >= 3 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
              margin: '0 0.5rem',
              transform: 'translateY(-12px)'
            }} />

            {/* Step 3: Out for delivery */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: getStatusStep(activeOrder.status) >= 3 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: getStatusStep(activeOrder.status) === 3 ? '0 0 15px var(--color-primary)' : 'none'
              }}>
                <Truck size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Out for Delivery</span>
            </div>

            {/* line 3 */}
            <div style={{
              flexGrow: 1,
              height: '4px',
              background: getStatusStep(activeOrder.status) >= 4 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
              margin: '0 0.5rem',
              transform: 'translateY(-12px)'
            }} />

            {/* Step 4: Delivered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: getStatusStep(activeOrder.status) >= 4 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: getStatusStep(activeOrder.status) === 4 ? '0 0 15px var(--color-primary)' : 'none'
              }}>
                <CheckCircle2 size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Delivered</span>
            </div>
          </div>

          {/* Items checklist */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Items Ordered:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>{item.name} <strong>x {item.quantity}</strong></span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAST ORDER HISTORY */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        Order History
      </h2>

      {loading ? (
        <div style={{ textTransform: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          No orders found. Once you place an order, it will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {orders.map((order) => {
            const isCompleted = order.status === 'Delivered';
            
            return (
              <div key={order._id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Order #{order._id}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Placed: {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Status Badge */}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: isCompleted ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 179, 0, 0.1)',
                      color: isCompleted ? 'var(--color-primary)' : 'var(--color-secondary)',
                      border: isCompleted ? '1px solid rgba(0, 200, 83, 0.2)' : '1px solid rgba(255, 179, 0, 0.2)',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      {order.status}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Listing order contents */}
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '0.75rem 1rem', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>Items:</div>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity} (₹{item.price} each)
                        {item.isCustom && item.customDetails && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            • Base: {item.customDetails.base} | Sauce: {item.customDetails.sauce} | Cheese: {item.customDetails.cheese}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
