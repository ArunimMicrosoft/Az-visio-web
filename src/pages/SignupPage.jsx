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
    
    setIsLoading(false);
    
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error || 'Signup failed. Please try again.');
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
              <div className="logo-icon">☁️</div>
              <h1>Azure Architecture Designer</h1>
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <small className="form-hint">Must be at least 6 characters</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
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
        <p>© 2026 Arunim's IT Caffe - Azure Architecture Designer v2.1.0</p>
      </div>
    </div>
  );
};

export default SignupPage;
