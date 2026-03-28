// Trial Watermark — subtle watermark overlay for trial users
// Replaces aggressive screenshot/right-click blocking with a professional approach
import React from 'react';
import './TrialWatermark.css';

const TrialWatermark = ({ isTrial }) => {
  if (!isTrial) return null;

  return (
    <div className="trial-watermark" aria-hidden="true">
      <div className="watermark-text">TRIAL</div>
      <div className="watermark-text">TRIAL</div>
      <div className="watermark-text">TRIAL</div>
    </div>
  );
};

export default TrialWatermark;
