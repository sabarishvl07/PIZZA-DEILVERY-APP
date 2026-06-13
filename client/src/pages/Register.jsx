import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pizza, User, Lock, Mail, ChevronRight, CheckCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      if (result.devMode) {
        // In dev mode, user is already verified — go straight to login
        navigate('/login', { state: { registered: true, email } });
      } else {
        setSuccess(true);
        if (result.emailPreview) {
          setEmailPreview(result.emailPreview);
        }
      }
    } else {
      setError(result.error);
    }
  };

  if (success) {
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
          maxWidth: '500px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 200, 83, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <CheckCircle size={50} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Verify Your Email</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            An email verification link has been sent to <strong>{email}</strong>. Please check your inbox and verify your email to log in.
          </p>

          {emailPreview && (
            <div style={{
              background: 'rgba(255, 179, 0, 0.1)',
              border: '1px dashed var(--color-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <h4 style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>🧪 Development Mail Preview</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                We sent this email using a test account. You can click below to view the email and click the verification button:
              </p>
              <a 
                href={emailPreview} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
              >
                Open Ethereal Mailbox
              </a>
            </div>
          )}

          <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

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
        maxWidth: '480px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 200, 83, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
            <Pizza size={40} color="var(--color-secondary)" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Join PizzaCraft to build and order customized pizzas</p>
        </div>

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
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Account Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User (Customer)</option>
              <option value="admin">Admin (Manager)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an order?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
