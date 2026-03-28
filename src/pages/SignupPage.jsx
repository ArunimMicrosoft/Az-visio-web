import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    const result = await signup(formData.email, formData.password, formData.name);
    
    setIsLoading(false);    if (result.success) {
      if (result.requiresConfirmation) {
        setError('Account created! Please check your email to confirm, then log in.');
      } else {
        // Show branded welcome screen before navigating
        setShowWelcome(true);
        setTimeout(() => navigate('/app'), 5000);
      }
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
  };
  // Branded welcome screen after successful signup
  if (showWelcome) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-pattern"></div>
        </div>
        <div className="auth-content" style={{ justifyContent: 'center' }}>
          <div className="auth-card" style={{ maxWidth: '560px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 100%)',
              padding: '32px',
              borderRadius: '12px 12px 0 0',
              margin: '-32px -32px 24px -32px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>☁️</div>
              <h1 style={{ color: '#fff', fontSize: '24px', margin: '0 0 4px' }}>
                Welcome to Cloud Canvas Designer!
              </h1>
              <p style={{ color: '#B3D7F2', fontSize: '14px', margin: 0 }}>
                Design. Validate. Deploy.
              </p>
            </div>

            <h2 style={{ color: '#1a1a1a', fontSize: '20px', margin: '0 0 12px' }}>
              🎉 Welcome, {formData.name || 'Architect'}!
            </h2>
            <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Your account has been created successfully. Your <strong>7-day free trial</strong> is now active.
            </p>

            <div style={{
              background: '#F0F7FF',
              borderLeft: '4px solid #0078D4',
              padding: '16px 20px',
              borderRadius: '0 8px 8px 0',
              textAlign: 'left',
              margin: '0 0 20px',
            }}>
              <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 8px', color: '#1a1a1a' }}>
                🎁 Your Free Trial Includes:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', fontSize: '13px', lineHeight: 1.8 }}>
                <li>Up to 3 architecture diagrams</li>
                <li>5 PNG exports</li>
                <li>Unlimited JSON exports</li>
                <li>All 150+ Azure service icons</li>
                <li>Drag-and-drop canvas</li>
              </ul>
            </div>

            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '14px 20px',
              margin: '0 0 24px',
              textAlign: 'left',
            }}>
              <p style={{ fontWeight: 600, fontSize: '13px', margin: '0 0 6px', color: '#1a1a1a' }}>
                Need help or login issues?
              </p>
              <p style={{ color: '#666', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
                📧 support@azuredesigner.com &nbsp;|&nbsp; 💬 Response within 24 hours
              </p>
            </div>

            <button
              onClick={() => navigate('/app')}
              className="auth-button primary"
              style={{ width: '100%', fontSize: '16px', padding: '14px' }}
            >
              🚀 Start Designing Now
            </button>
            <p style={{ color: '#999', fontSize: '12px', marginTop: '12px' }}>
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">☁️</div>
              <h1>Cloud Canvas Designer</h1>
              <p className="tagline">Design. Validate. Deploy.</p>
            </div>
          </div>
          
          <div className="auth-form-container">
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">Start designing enterprise Azure architectures today</p>
            
            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px',
                      color: '#666',
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <small className="form-hint">Must be at least 6 characters</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px',
                      color: '#666',
                    }}
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="auth-button primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </div>
            
            <div className="auth-terms">
              <p>
                By creating an account, you agree to our{' '}
                <a href="#" className="terms-link">Terms of Service</a> and{' '}
                <a href="#" className="terms-link">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="auth-info">
          <div className="info-card featured">
            <div className="info-badge">✨ FREE</div>
            <h3>Start Free, Scale as You Grow</h3>
            <ul className="feature-list">
              <li>✓ Unlimited diagrams</li>
              <li>✓ 150+ Azure service icons</li>
              <li>✓ Real-time cost estimation</li>
              <li>✓ Architecture validation</li>
              <li>✓ Export to Terraform & ARM</li>
              <li>✓ Professional PDF reports</li>
            </ul>
          </div>
          
          <div className="testimonial">
            <p className="quote">
              "This tool saved our team weeks of architecture planning. 
              The cost estimation alone is worth it!"
            </p>
            <div className="author">
              <strong>Sarah Chen</strong>
              <span>Cloud Architect, TechCorp</span>
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

export default SignupPage;
