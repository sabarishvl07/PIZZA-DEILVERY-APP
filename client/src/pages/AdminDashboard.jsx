import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BarChart3, ShoppingBag, ClipboardList, Database, AlertTriangle, TrendingUp, Edit3, Check, X, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, inventory
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inventory Inline Editing States
  const [editItemId, setEditItemId] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [editThreshold, setEditThreshold] = useState(0);

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      const [resStats, resOrders, resInventory] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/orders'),
        axios.get('/api/admin/inventory')
      ]);
      
      setStats(resStats.data);
      setOrders(resOrders.data);
      setInventory(resInventory.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('Failed to load dashboard metrics. Ensure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // WebSockets setup for Admin
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Admin Socket Connected for Live Updates');
    });

    // Listen for new orders placed by users
    socket.on('new_order', (newOrder) => {
      console.log('Socket Alert: New order placed!', newOrder);
      // Prepend new order to list
      setOrders(prev => [newOrder, ...prev]);
      
      // Refresh statistics and inventory stock
      fetchAdminData();
    });

    // Listen for inventory stock updates
    socket.on('stock_updated', () => {
      console.log('Socket Alert: Stock level update detected');
      fetchAdminData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update order status trigger
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      // Update local state list
      setOrders(prev => 
        prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
      );
      // Refresh stats
      const resStats = await axios.get('/api/admin/stats');
      setStats(resStats.data);
    } catch (err) {
      console.error('Error changing order status:', err);
      alert('Could not update status. Try again.');
    }
  };

  // Inline inventory edit triggers
  const startEdit = (item) => {
    setEditItemId(item._id);
    setEditQty(item.quantity);
    setEditThreshold(item.threshold);
  };

  const saveEdit = async (itemId) => {
    try {
      const res = await axios.patch(`/api/admin/inventory/${itemId}`, {
        quantity: Number(editQty),
        threshold: Number(editThreshold)
      });
      
      // Update local state list
      setInventory(prev => 
        prev.map(item => item._id === itemId ? res.data.ingredient : item)
      );
      setEditItemId(null);
      
      // Refresh stats
      const resStats = await axios.get('/api/admin/stats');
      setStats(resStats.data);
    } catch (err) {
      console.error('Error updating inventory item:', err);
      alert('Failed to update stock levels.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading admin panel dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-accent)' }}>
        <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Admin Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage store menu stock, update user order progress, and view metrics</p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BarChart3 size={16} /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ShoppingBag size={16} /> Orders List ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Database size={16} /> Inventory Stock
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(0, 200, 83, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <TrendingUp size={28} color="var(--color-primary)" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Revenue</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{stats.totalRevenue}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 179, 0, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <ClipboardList size={28} color="var(--color-secondary)" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Orders</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.totalOrders}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(0, 176, 255, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <ShoppingBag size={28} color="#00b0ff" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Cooking</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.activeOrders}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              border: stats.lowStockCount > 0 ? '1px solid rgba(255, 61, 0, 0.3)' : '1px solid var(--border-glass)'
            }}>
              <div style={{ 
                background: stats.lowStockCount > 0 ? 'rgba(255, 61, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius-sm)' 
              }}>
                <AlertTriangle size={28} color={stats.lowStockCount > 0 ? 'var(--color-accent)' : 'var(--text-muted)'} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Low Stock Warning</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: stats.lowStockCount > 0 ? 'var(--color-accent)' : '#fff' }}>
                  {stats.lowStockCount} items
                </h3>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts Breakdown */}
          {stats.lowStockCount > 0 && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-accent)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ff8a80', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} /> Safety Stock Breached (Threshold Warnings)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                The following ingredients are low. Mails have been compiled to support teams for purchasing updates.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {stats.lowStockItems.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 61, 0, 0.05)',
                    border: '1px solid rgba(255, 61, 0, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                    <span style={{ color: '#ff8a80', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {item.quantity} / {item.threshold} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Customer Order Requests</h2>
          
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No client orders placed yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Order ID</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Customer Details</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Pizzas Feasted</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Amount</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Live Stage Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1.25rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      #{order._id.substring(18)}
                    </td>
                    <td style={{ padding: '1.25rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{order.user?.name || 'Anonymous User'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email || ''}</div>
                    </td>
                    <td style={{ padding: '1.25rem 0.5rem', maxWidth: '300px' }}>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem' }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x {item.quantity}
                            {item.isCustom && item.customDetails && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)' }}> (Custom)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ padding: '1.25rem 0.5rem', fontWeight: 'bold' }}>
                      ₹{order.totalAmount}
                    </td>
                    <td style={{ padding: '1.25rem 0.5rem' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          color: '#fff',
                          border: '1px solid var(--border-glass)',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="Order Received">Order Received</option>
                        <option value="In the Kitchen">In the Kitchen</option>
                        <option value="Sent to Delivery">Sent to Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: INVENTORY STOCK */}
      {activeTab === 'inventory' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Stock Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Deductions execute on checkout. Edit inventory safety stock levels and threshold targets inline.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>Ingredient Name</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Price Surcharge</th>
                <th style={{ padding: '1rem' }}>Current Stock</th>
                <th style={{ padding: '1rem' }}>Email Alert Threshold</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isEditing = editItemId === item._id;
                const isLow = item.quantity <= item.threshold;
                
                return (
                  <tr key={item._id} style={{ 
                    borderBottom: '1px solid var(--border-glass)', 
                    fontSize: '0.9rem',
                    background: isLow ? 'rgba(255,61,0,0.02)' : 'none'
                  }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {item.name}
                      {isLow && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          background: 'rgba(255, 61, 0, 0.15)',
                          color: '#ff8a80',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          border: '1px solid rgba(255,61,0,0.2)'
                        }}>
                          LOW
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {item.itemType}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      ₹{item.price}
                    </td>
                    
                    {/* Quantity Edit cell */}
                    <td style={{ padding: '1rem' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          style={{ width: '80px', padding: '0.3rem' }}
                        />
                      ) : (
                        <span style={{ color: isLow ? '#ff8a80' : 'var(--color-primary)', fontWeight: 'bold' }}>
                          {item.quantity} units
                        </span>
                      )}
                    </td>

                    {/* Threshold Edit cell */}
                    <td style={{ padding: '1rem' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(e.target.value)}
                          style={{ width: '80px', padding: '0.3rem' }}
                        />
                      ) : (
                        <span>{item.threshold} units</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => saveEdit(item._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                            <Check size={14} /> Save
                          </button>
                          <button onClick={() => setEditItemId(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(item)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Edit3 size={12} /> Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
