// Admin Configuration — centralized admin email list
// Move admin emails here instead of hardcoding in multiple files
// In production, these should come from env vars or a DB config table

const ENV_ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS || '';

const DEFAULT_ADMIN_EMAILS = [
  'arunimpandey2903@hotmail.com',
  'demo@arunimitcaffe.com',
  'admin@azuredesigner.com',
];

// Merge env-provided emails with defaults
const envEmails = ENV_ADMIN_EMAILS
  ? ENV_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  : [];

export const ADMIN_EMAILS = [...new Set([...DEFAULT_ADMIN_EMAILS, ...envEmails])];

export function isAdminEmail(email) {
  return email && ADMIN_EMAILS.includes(email.toLowerCase());
}
