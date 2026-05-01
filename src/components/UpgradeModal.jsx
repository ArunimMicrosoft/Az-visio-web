import React from 'react';
import './UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose, reason, feature }) => {
  if (!isOpen) return null;

  // Open payment in a NEW TAB so the canvas (items, connections, boundaries)
  // is fully preserved in the current tab. When payment completes the new tab
  // posts a 'PAYMENT_SUCCESS' message back here, then closes itself.
  const handleUpgrade = (plan) => {
    const url = `${window.location.origin}/payment?plan=${plan}&return=tab`;
    window.open(url, '_blank', 'noopener');
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
                <li>✗ PDF export</li>
                <li>✗ IaC exports</li>
              </ul>
            </div>

            <div className="upgrade-column upgrade-starter">
              <h3>Starter</h3>
              <div className="upgrade-price">
                <span className="price-main">$6</span>
                <span className="price-sub">/mo</span>
              </div>
              <div className="upgrade-price-inr">₹499/mo</div>
              <ul>
                <li>✓ 25 diagrams</li>
                <li>✓ 50 PNG exports</li>
                <li>✓ PDF export</li>
                <li>✓ No watermark</li>
                <li>✓ Share links</li>
              </ul>
              <button onClick={() => handleUpgrade('starter')} className="upgrade-btn-starter">
                Get Starter
              </button>
            </div>

            <div className="upgrade-column upgrade-pro">
              <div className="upgrade-badge">Most Popular</div>
              <h3>Professional</h3>
              <div className="upgrade-price">
                <span className="price-main">$24</span>
                <span className="price-sub">/mo</span>
              </div>
              <div className="upgrade-price-inr">₹2,000/mo</div>
              <ul>
                <li>✓ Unlimited everything</li>
                <li>✓ Terraform & Bicep</li>
                <li>✓ ARM templates</li>
                <li>✓ TF paste & import</li>
                <li>✓ Priority support</li>
              </ul>
              <button onClick={() => handleUpgrade('professional')} className="upgrade-btn-pro">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        <div className="upgrade-modal-footer">
          <p>🔒 Secure payment powered by Razorpay • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
