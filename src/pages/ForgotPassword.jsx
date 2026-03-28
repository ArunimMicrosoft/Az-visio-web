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
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">🔑</div>
              <h1>Cloud Canvas Designer</h1>
              <p className="tagline">Design. Validate. Deploy.</p>
            </div>
          </div>

          <div className="auth-form-container">
            {sent ? (
              <>
                <div className="auth-success-icon">📧</div>
                <h2>Check Your Email</h2>
                <p className="auth-subtitle">
                  We sent a password reset link to <strong>{email}</strong>.
                  Click the link in the email to set a new password.
                </p>
                <p className="auth-hint">
                  Didn't receive it? Check your spam folder or try again.
                </p>
                <button
                  className="auth-button primary"
                  onClick={() => { setSent(false); setEmail(''); }}
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <h2>Reset Password</h2>
                <p className="auth-subtitle">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="auth-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-button primary"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            <div className="auth-footer">
              <p>
                <Link to="/login" className="auth-link">← Back to Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-branding">
        <p>© 2026 Arunim's IT Café - Cloud Canvas Designer v1.0.0</p>
        <Link to="/" className="auth-home-link">← Back to Home</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
