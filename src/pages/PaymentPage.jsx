import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createRazorpayOrder, verifyRazorpayPayment, getPricingPlans } from '../services/razorpayService';
import { upgradeToPaid } from '../utils/authSecurity';
import './PaymentPage.css';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('INR');
  
  const planType = searchParams.get('plan') || 'professional';
  const pricingPlans = getPricingPlans();
  const plan = pricingPlans.find(p => p.id === planType);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    company: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.email || !formData.name) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Get amount based on currency
      const amount = currency === 'INR' ? plan.priceINR : plan.priceUSD;

      // Create Razorpay order and open checkout
      const paymentResponse = await createRazorpayOrder({
        planName: plan.name,
        amount: amount,
        customerEmail: formData.email,
        customerName: formData.name,
        customerId: user?.id || 'guest',
      });

      // Verify payment on backend
      const verificationResult = await verifyRazorpayPayment({
        ...paymentResponse,
        planName: plan.name,
        customerId: user?.id,
        customerEmail: formData.email,
      });      if (verificationResult.verified) {
        // Upgrade user subscription
        if (user) {
          upgradeToPaid(user.id, plan.id);
        }

        // Redirect to success page
        navigate(`/payment-success?payment_id=${paymentResponse.paymentId}&plan=${plan.id}`);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (err.message === 'Payment cancelled by user') {
        setError('Payment was cancelled. Please try again when ready.');
      } else {
        setError(err.message || 'Payment processing failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-error">
            <h2>Invalid Plan</h2>
            <p>The selected plan does not exist.</p>
            <button onClick={() => navigate('/')} className="btn-back">
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">          <button onClick={() => navigate('/')} className="btn-back-link">
            ← Back to Home
          </button>
          <h1>Complete Your Purchase</h1>
          <p>Secure payment powered by Razorpay</p>
        </div>

        <div className="payment-content">          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            {/* Currency Selector */}
            <div className="currency-selector">
              <label>Select Currency:</label>
              <div className="currency-buttons">
                <button
                  type="button"
                  className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                  onClick={() => setCurrency('USD')}
                >
                  🇺🇸 USD
                </button>
                <button
                  type="button"
                  className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
                  onClick={() => setCurrency('INR')}
                >
                  🇮🇳 INR
                </button>
              </div>
            </div>

            <div className="plan-details">
              <div className="plan-info">
                <h3>{plan.name} Plan</h3>
                <p className="plan-billing">Billed monthly</p>
              </div>              <div className="plan-price">
                {currency === 'USD' ? (
                  <>
                    <span className="price-amount">${plan.priceUSD}</span>
                    <span className="price-period">/mo</span>
                  </>
                ) : (
                  <>
                    <span className="price-amount">₹{plan.priceINR.toLocaleString('en-IN')}</span>
                    <span className="price-period">/mo</span>
                  </>
                )}
              </div>
            </div>

            <div className="plan-features">
              <h4>Includes:</h4>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>            <div className="total-amount">
              <span>Total Due Today</span>
              <span className="total-price">
                {currency === 'USD' 
                  ? `$${plan.priceUSD}.00` 
                  : `₹${plan.priceINR.toLocaleString('en-IN')}`
                }
              </span>
            </div>            <div className="payment-security">
              <p>🔒 Secured by Razorpay</p>
              <p className="security-note">
                Your payment information is encrypted and secure. 
                We never store your credit card details.
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-container">
            <form onSubmit={handleSubmit} className="payment-form">
              <h2>Payment Information</h2>              {error && (
                <div className="error-message">
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@company.com"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company Name</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Your Company Inc."
                    />
                  </div>
                </div>              </div>              <div className="form-section razorpay-notice">
                <h3>💳 Payment Method</h3>
                <div className="razorpay-info">
                  <p>
                    <strong>Secure Payment via Razorpay</strong>
                  </p>
                  <p>
                    After clicking "Proceed to Payment", Razorpay's secure checkout will open 
                    where you can enter your payment information.
                  </p>
                  <ul className="razorpay-benefits">
                    <li>✓ Industry-standard encryption</li>
                    <li>✓ PCI DSS compliant</li>
                    <li>✓ Support for all major credit/debit cards</li>
                    <li>✓ UPI, Netbanking, and Wallets supported</li>
                    <li>✓ No card details stored on our servers</li>
                  </ul>
                </div>              </div>{/* end razorpay-notice */}

              <button 
                type="submit" 
                className="btn-submit-payment"
                disabled={loading}
              >
                {loading ? 'Processing Payment...' : `Proceed to Payment - ${currency === 'INR' ? '₹' + plan.priceINR.toLocaleString('en-IN') : '$' + plan.priceUSD}/month`}
              </button>

              <p className="terms-note">
                By confirming your subscription, you agree to our{' '}
                <a href="/terms" target="_blank">Terms of Service</a> and{' '}
                <a href="/privacy" target="_blank">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
