import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose, reason, feature }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = (plan) => {
    navigate(`/payment?plan=${plan}`);
    onClose();
  };

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upgrade-modal-close" onClick={onClose}>×</button>
        
        <div className="upgrade-modal-header">
          <div className="upgrade-icon">🚀</div>
          <h2>Upgrade Required</h2>
          <p className="upgrade-reason">{reason || `${feature} is not available in the trial version.`}</p>
        </div>

        <div className="upgrade-modal-body">
          <div className="upgrade-comparison">
            <div className="upgrade-column upgrade-trial">
              <h3>Trial (Current)</h3>
              <ul>
                <li>✓ 7 days access</li>
                <li>✓ 5 PNG exports</li>
                <li>✓ 3 diagrams max</li>
                <li>✗ SVG/PDF export</li>
                <li>✗ JSON export</li>
                <li>✗ Unlimited diagrams</li>
              </ul>
            </div>

            <div className="upgrade-column upgrade-pro">
              <div className="upgrade-badge">Most Popular</div>
              <h3>Professional</h3>
              <div className="upgrade-price">
                <span className="price-main">$49</span>
                <span className="price-sub">/mo</span>
              </div>
              <div className="upgrade-price-inr">₹4,099/mo</div>
              <ul>
                <li>✓ Unlimited diagrams</li>
                <li>✓ All export formats</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority support</li>
                <li>✓ Custom domains</li>
              </ul>
              <button onClick={() => handleUpgrade('professional')} className="upgrade-btn-pro">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        <div className="upgrade-modal-footer">
          <p>🔒 Secure payment powered by Stripe • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
