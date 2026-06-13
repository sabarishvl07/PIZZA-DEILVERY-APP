import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Pizza, ShoppingCart, LogOut, ShieldAlert, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Don't show navbar if logged out

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      margin: '1rem',
      borderRadius: 'var(--radius-sm)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-md)'
    }}>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>
        <Pizza size={28} color="var(--color-secondary)" className="pulse" />
        <span className="gradient-text">PIZZACRAFT</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link 
          to="/dashboard" 
          style={{ 
            color: location.pathname === '/dashboard' ? 'var(--color-primary)' : 'var(--text-primary)',
            fontWeight: location.pathname === '/dashboard' ? '600' : '400'
          }}
        >
          Dashboard
        </Link>
        <Link 
          to="/build-pizza" 
          style={{ 
            color: location.pathname === '/build-pizza' ? 'var(--color-primary)' : 'var(--text-primary)',
            fontWeight: location.pathname === '/build-pizza' ? '600' : '400'
          }}
        >
          Build Custom Pizza
        </Link>
        <Link 
          to="/orders" 
          style={{ 
            color: location.pathname === '/orders' ? 'var(--color-primary)' : 'var(--text-primary)',
            fontWeight: location.pathname === '/orders' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <ClipboardList size={16} />
          My Orders
        </Link>

        {user.role === 'admin' && (
          <Link 
            to="/admin" 
            style={{ 
              color: location.pathname.startsWith('/admin') ? 'var(--color-secondary)' : '#ffab40',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              border: '1px solid rgba(255, 171, 64, 0.3)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 171, 64, 0.05)'
            }}
          >
            <ShieldAlert size={16} />
            Admin Panel
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link 
          to="/checkout" 
          style={{ 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.5rem', 
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)'
          }}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--color-accent)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
