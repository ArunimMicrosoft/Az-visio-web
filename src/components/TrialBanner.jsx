import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrialStatus } from '../utils/authSecurity';
import './TrialBanner.css';

const TrialBanner = ({ user }) => {
  const navigate = useNavigate();
  const trialStatus = getTrialStatus(user);

  console.log('🎁 TrialBanner - User:', user);
  console.log('🎁 TrialBanner - Trial Status:', trialStatus);

  if (!trialStatus.isTrial || !trialStatus.isActive) {
    console.log('🎁 TrialBanner - Not showing (isTrial:', trialStatus.isTrial, 'isActive:', trialStatus.isActive, ')');
    return null;
  }

  const handleUpgrade = () => {
    navigate('/payment?plan=professional');
  };

  return (
    <div className={`trial-banner ${trialStatus.isGracePeriod ? 'trial-banner-expired' : ''}`}>
      <div className="trial-banner-content">
        <div className="trial-info">
          {trialStatus.isGracePeriod ? (
            <>
              <span className="trial-badge trial-badge-expired">⚠️ Grace Period</span>
              <span className="trial-text">
                Your trial has expired. Upgrade now to continue.
              </span>
            </>
          ) : (
            <>
              <span className="trial-badge">🎁 Trial Active</span>
              <span className="trial-text">
                {trialStatus.daysRemaining} days • {trialStatus.exportsRemaining}/5 PNG exports • {trialStatus.diagramsRemaining}/3 diagrams
              </span>
            </>
          )}
        </div>
        <button onClick={handleUpgrade} className="trial-upgrade-btn">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default TrialBanner;
