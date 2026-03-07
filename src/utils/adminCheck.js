/**
 * Admin Check Utility
 * Determines if a user has admin privileges
 */

/**
 * Check if the current user is an admin
 * @param {object} user - User object from AuthContext
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const isAdmin = (user) => {
  if (!user) return false;
  
  // Check if user has admin role
  if (user.role === 'admin') return true;
  
  // Check if user email is admin email
  if (user.email && user.email.toLowerCase() === 'admin@azuredesigner.com') return true;
  
  return false;
};

/**
 * Get admin email (for display purposes)
 */
export const getAdminEmail = () => {
  return 'admin@azuredesigner.com';
};
