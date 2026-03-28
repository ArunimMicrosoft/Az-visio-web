import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseResetPassword } from '../utils/supabase';
import './AuthPages.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await supabaseResetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">🔑</div>
            <h1>Reset Password</h1>
            <p className="tagline">Cloud Canvas Designer</p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📧</div>
              <h2 style={{ color: '#333', marginBottom: '8px' }}>Check Your Email</h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
                We sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to set a new password.
              </p>
              <p style={{ color: '#999', fontSize: '12px', marginTop: '16px' }}>
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  marginTop: '16px', padding: '10px 24px', background: '#0078D4',
                  color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600,
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: '#fee', color: '#c00', padding: '10px 14px',
                  borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
                  border: '1px solid #fcc',
                }}>
                  {error}
                </div>
              )}

              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" style={{ color: '#0078D4', textDecoration: 'none', fontSize: '14px' }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>

        <div className="auth-branding">
          <p>© 2026 Arunim's IT Café - Cloud Canvas Designer v1.0.0</p>
          <Link to="/" className="auth-home-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
