import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
      setIsLoading(true);
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      // Check if user is admin
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    const result = await login('demo@azuredesigner.com', 'Demo@123');
    setIsLoading(false);
    
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error || 'Demo login failed');
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
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue to your workspace</p>
            
            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>            <div className="auth-divider">
              <span>or</span>
            </div>
            
            <button 
              type="button" 
              className="auth-button demo"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <span className="demo-icon">🚀</span>
              Try Demo Account
            </button>
            
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">Sign up for free</Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="auth-info">
          <div className="info-card">
            <div className="info-icon">🏗️</div>
            <h3>Enterprise-Grade Design</h3>
            <p>Create professional Azure architecture diagrams with 150+ Azure services</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">✅</div>
            <h3>Real-Time Validation</h3>
            <p>Validate your architecture against Azure best practices and WAF</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">💰</div>
            <h3>Cost Estimation</h3>
            <p>Get real-time pricing with Azure Retail Rates API integration</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📦</div>
            <h3>Export Anywhere</h3>
            <p>Export to Terraform, ARM, PDF, PNG with professional branding</p>
          </div>
        </div>
      </div>
      
      <div className="auth-branding">
        <p>© 2026 Arunim's IT Caffe - Azure Architecture Designer v2.1.0</p>
      </div>
    </div>
  );
};

export default LoginPage;
