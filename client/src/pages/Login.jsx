import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pizza, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email and show banner if redirected from registration
  const registered = location.state?.registered;
  const registeredEmail = location.state?.email;
  const [email, setEmail] = useState(registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at top right, rgba(0, 200, 83, 0.05), transparent), radial-gradient(circle at bottom left, rgba(255, 179, 0, 0.05), transparent)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 200, 83, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
            <Pizza size={40} color="var(--color-secondary)" className="pulse" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Log in to order your custom pizza delight</p>
        </div>

        {registered && (
          <div style={{
            background: 'rgba(0, 200, 83, 0.1)',
            border: '1px solid rgba(0, 200, 83, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: '#69f0ae',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            🎉 Account created! You can now log in.
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255, 61, 0, 0.1)',
            border: '1px solid rgba(255, 61, 0, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: '#ff8a80',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>Forgot Password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
