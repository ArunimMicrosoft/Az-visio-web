import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
    const paymentId = searchParams.get('payment_id');
  const plan = searchParams.get('plan') || 'professional';
  const [initialError] = useState(() => !paymentId ? 'Invalid payment reference' : null);

  useEffect(() => {
    // Auto-redirect to app after 5 seconds
    if (!initialError && paymentId) {
      const timer = setTimeout(() => {
        navigate('/app');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [navigate, initialError, paymentId]);  return (
    <div className="payment-success-page">
      <div className="success-container">
        {initialError ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h1>Payment Verification Failed</h1>
            <p className="error-message">{initialError}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Return to Home
            </button>
          </div>
        ) : (
          <>
            <div className="success-icon">
              <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="25" fill="#10b981"/>
                <path fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" d="M14 27l7 7 16-16"/>
              </svg>
            </div>

            <h1>Payment Successful!</h1>
            <p className="success-message">
              Welcome to the {plan.charAt(0).toUpperCase() + plan.slice(1)} plan! 
              Your subscription is now active.
            </p>

            <div className="payment-info">
              <p><strong>Payment ID:</strong> {paymentId}</p>
              <p><strong>Plan:</strong> {plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
            </div>
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-icon">📧</span>
            <span>Confirmation email sent</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span>Account upgraded</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🚀</span>
            <span>All features unlocked</span>
          </div>
        </div>
            
            <div className="success-actions">
              <button onClick={() => navigate('/app')} className="btn-primary">
                Start Designing
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Back to Home
              </button>
            </div>

            <p className="redirect-note">
              You will be redirected to the app in 5 seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
