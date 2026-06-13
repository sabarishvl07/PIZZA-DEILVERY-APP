import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Pizza, Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setEmailPreview(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.emailPreview) {
        setEmailPreview(res.data.emailPreview);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 179, 0, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
            <Pizza size={40} color="var(--color-secondary)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
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

        {message && (
          <div style={{
            background: 'rgba(0, 200, 83, 0.1)',
            border: '1px solid rgba(0, 200, 83, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: '#a7ffeb',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {emailPreview && (
          <div style={{
            background: 'rgba(255, 179, 0, 0.1)',
            border: '1px dashed var(--color-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>🧪 Development Mail Preview</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              For testing convenience, here is the Ethereal link to check the reset email:
            </p>
            <a 
              href={emailPreview} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
            >
              Open Reset Mailbox
            </a>
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

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Sending...' : (
              <>
                <Send size={16} /> Send Reset Link
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
