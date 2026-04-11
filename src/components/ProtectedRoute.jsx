import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTrialStatus, isAdminUser } from '../utils/authSecurity';

/* ─────────────────────────────────────────────────────────────────────────────
   Full-screen trial-expired gate — user cannot dismiss or bypass this
───────────────────────────────────────────────────────────────────────────── */
const TrialExpiredGate = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const expiredDate = user?.trialExpiresAt
    ? new Date(user.trialExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'recently';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        padding: '56px 48px',
        maxWidth: '520px',
        width: '90%',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Icon */}
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>

        {/* Title */}
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, margin: '0 0 12px' }}>
          Your Free Trial Has Ended
        </h1>

        {/* Subtitle */}
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 8px' }}>
          Your 7-day free trial expired on <strong style={{ color: '#fff' }}>{expiredDate}</strong>.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 36px' }}>
          Upgrade to keep all your diagrams and continue building.
        </p>

        {/* What they lose box */}
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
            Upgrade to unlock
          </p>
          {[
            ['♾️', 'Unlimited diagrams & exports'],
            ['📄', 'PDF, Terraform & ARM exports'],
            ['🚫', 'No watermarks, no limits'],
            ['🔒', 'Priority support'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{ color: '#fff', fontSize: '14px' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <button
          onClick={() => navigate('/payment?plan=professional')}
          style={{
            width: '100%', padding: '16px', marginBottom: '12px',
            background: 'linear-gradient(135deg, #0078D4 0%, #005a9e 100%)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,120,212,0.4)',
            transition: 'transform 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🚀 Upgrade to Professional — ₹2,000/mo
        </button>

        <button
          onClick={() => navigate('/payment?plan=enterprise')}
          style={{
            width: '100%', padding: '14px', marginBottom: '24px',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          🏢 Enterprise Plan — ₹12,499/mo
        </button>

        <button
          onClick={logout}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: '13px',
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ProtectedRoute — guards /app and /admin
   • Not logged in  → /login
   • Trial expired  → TrialExpiredGate (full-screen block, cannot be bypassed)
   • Admin route    → only admin role allowed
   • Otherwise      → render children
───────────────────────────────────────────────────────────────────────────── */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0078D4 0%, #005a9e 100%)',
        color: 'white', fontSize: '20px', fontFamily: 'Segoe UI, Arial, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>☁️</div>
          <div>Loading Azure Designer...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Banned user — force logout
  if (user && user.isActive === false) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #1a0000 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '460px',
          width: '90%',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
          <h1 style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
            Account Suspended
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 32px' }}>
            Your account has been suspended by an administrator. If you believe this is an error, please contact support.
          </p>
          <button
            onClick={() => { logout(); }}
            style={{
              padding: '12px 32px', background: 'rgba(255,255,255,0.1)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Admin-only route guard
  if (adminOnly && !isAdminUser(user) && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  // Trial expired — hard block (skip for admin users)
  if (!isAdminUser(user) && user?.role !== 'admin') {
    const trialStatus = getTrialStatus(user);
    if (trialStatus.isHardExpired) {
      return <TrialExpiredGate user={user} />;
    }
  }

  return children;
};

export default ProtectedRoute;
