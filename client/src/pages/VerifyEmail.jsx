import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Pizza, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Token is missing.');
        return;
      }

      try {
        const res = await axios.get(`/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The token may have expired or is invalid.');
      }
    };

    verifyToken();
  }, [token]);

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
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 800, fontSize: '1.5rem' }}>
          <Pizza size={32} color="var(--color-secondary)" />
          <span className="gradient-text">PIZZACRAFT</span>
        </div>

        {status === 'verifying' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Loader2 size={50} color="var(--color-primary)" className="pulse" style={{ animation: 'spin 1.5s linear infinite' }} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Verifying your email...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we confirm your registration details.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 200, 83, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <CheckCircle size={50} color="var(--color-primary)" />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Log In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 61, 0, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <XCircle size={50} color="var(--color-accent)" />
            </div>
            <h2 style={{ marginBottom: '0.5rem', color: '#ff8a80' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              {message}
            </p>
            <Link to="/register" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              Create a New Account
            </Link>
            <Link to="/login" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Go to Login Page
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
