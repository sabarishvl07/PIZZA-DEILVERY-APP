import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Pizza, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token found in URL.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
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
          maxWidth: '450px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 200, 83, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <CheckCircle size={50} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Password Updated</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Your password has been reset successfully. You can now use your new password to log in.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Go to Login
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
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 200, 83, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
            <Pizza size={40} color="var(--color-secondary)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>New Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Choose a secure password for your account</p>
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
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                disabled={!token}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                disabled={!token}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !token} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
