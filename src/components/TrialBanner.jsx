import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrialStatus } from '../utils/authSecurity';
import './TrialBanner.css';

// Plan display names and colours
const PLAN_META = {
  starter:      { label: 'Starter',      color: '#10b981', emoji: '⭐' },
  professional: { label: 'Professional', color: '#0078D4', emoji: '🚀' },
  enterprise:   { label: 'Enterprise',   color: '#7c3aed', emoji: '🏢' },
};

/**
 * Returns days remaining until `expiresAt` ISO string, clamped to >= 0.
 */
function daysUntil(isoDate) {
  if (!isoDate) return null;
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

const TrialBanner = ({ user }) => {
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  // Re-render every minute so countdown stays live
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!user) return null;

  // Admin accounts — show nothing at all
  if (user.isAdmin || user.role === 'admin') return null;

  const tier = user.subscriptionTier || 'trial';

  // ── PAID PLAN BANNER ──────────────────────────────────────────────────────
  if (tier !== 'trial') {
    const meta = PLAN_META[tier] || { label: tier, color: '#0078D4', emoji: '✅' };    const daysLeft = daysUntil(user.subscriptionExpiresAt);
    const isExpiringSoon = daysLeft !== null && daysLeft <= 5;
    const isExpired = daysLeft !== null && daysLeft === 0;

    return (
      <div
        className={`trial-banner plan-banner${isExpiringSoon ? ' plan-banner-warning' : ''}`}
        style={{ background: `linear-gradient(135deg, ${meta.color}cc 0%, ${meta.color} 100%)` }}
      >
        <div className="trial-banner-content">
          <div className="trial-info">
            <span className="trial-badge" style={{ background: 'rgba(255,255,255,0.25)' }}>
              {meta.emoji} {meta.label} Plan
            </span>
            {daysLeft !== null ? (
              isExpired ? (
                <span className="trial-text plan-text-warning">
                  ⚠️ Subscription expired — renew to keep access
                </span>
              ) : (
                <span className={`trial-text${isExpiringSoon ? ' plan-text-warning' : ''}`}>
                  {isExpiringSoon ? '⚠️ ' : ''}
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                  {user.subscriptionExpiresAt &&
                    ` · renews ${new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </span>
              )
            ) : (
              <span className="trial-text">Active subscription · Unlimited access</span>
            )}
          </div>
          {(isExpiringSoon || isExpired) && (
            <button
              onClick={() => navigate('/payment?plan=' + tier)}
              className="trial-upgrade-btn"
            >
              Renew Now
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── TRIAL BANNER ──────────────────────────────────────────────────────────
  const trialStatus = getTrialStatus(user);

  if (!trialStatus.isTrial || !trialStatus.isActive) return null;

  return (
    <div className={`trial-banner ${trialStatus.isGracePeriod ? 'trial-banner-expired' : ''}`}>
      <div className="trial-banner-content">
        <div className="trial-info">
          {trialStatus.isGracePeriod ? (
            <>
              <span className="trial-badge trial-badge-expired">⚠️ Grace Period</span>
              <span className="trial-text">Your trial has expired. Upgrade now to continue.</span>
            </>
          ) : (
            <>
              <span className="trial-badge">🎁 Trial Active</span>
              <span className="trial-text">
                {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''} left
                &nbsp;·&nbsp;
                {trialStatus.exportsRemaining}/5 PNG exports
                &nbsp;·&nbsp;
                {trialStatus.diagramsRemaining}/3 diagrams
              </span>
            </>
          )}
        </div>
        <button onClick={() => navigate('/payment?plan=professional')} className="trial-upgrade-btn">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default TrialBanner;
