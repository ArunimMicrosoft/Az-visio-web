/**
 * Admin Check Utility
 * Determines if a user has admin privileges
 */

// Canonical list — keep in sync with AdminDashboard.jsx ADMIN_EMAILS
const ADMIN_EMAILS = [
  'arunimpandey2903@hotmail.com',
  'demo@arunimitcaffe.com',
  'admin@azuredesigner.com',   // default fallback admin
];

/**
 * Check if the current user is an admin
 * @param {object} user - User object from AuthContext
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const isAdmin = (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  return false;
};

/**
 * Get admin email (for display purposes)
 */
export const getAdminEmail = () => {
  return 'admin@azuredesigner.com';
};
