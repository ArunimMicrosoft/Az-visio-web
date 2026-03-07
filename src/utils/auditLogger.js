/**
 * Audit Logger for Authentication Events
 * Logs all login/signup attempts to localStorage for security audit trail
 */

const AUDIT_LOG_KEY = 'azureDesigner_audit_log';
const MAX_LOG_ENTRIES = 1000; // Keep last 1000 entries

/**
 * Log an authentication event
 * @param {string} eventType - 'login', 'signup', 'logout', 'login_failed', 'signup_failed'
 * @param {object} details - Event details (email, success, error, etc.)
 */
export const logAuthEvent = (eventType, details = {}) => {
  try {
    // Get existing logs
    const logs = getAuditLogs();
    
    // Create new log entry
    const logEntry = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      eventType,
      details: {
        email: details.email || 'unknown',
        success: details.success !== undefined ? details.success : true,
        error: details.error || null,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        // Note: IP address is not available in browser context
        // In production, this would be logged server-side
        sessionId: getOrCreateSessionId()
      },
      metadata: {
        appVersion: '2.0.0',
        environment: import.meta.env.MODE || 'production'
      }
    };
    
    // Add to logs array
    logs.push(logEntry);
    
    // Keep only the last MAX_LOG_ENTRIES
    const trimmedLogs = logs.slice(-MAX_LOG_ENTRIES);
    
    // Save back to localStorage
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmedLogs));
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('🔐 [AUDIT LOG]', logEntry);
    }
    
    return logEntry;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
};

/**
 * Get all audit logs
 * @returns {Array} Array of log entries
 */
export const getAuditLogs = () => {
  try {
    const logsJson = localStorage.getItem(AUDIT_LOG_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs filtered by event type
 * @param {string} eventType - Event type to filter by
 * @returns {Array} Filtered log entries
 */
export const getAuditLogsByType = (eventType) => {
  const logs = getAuditLogs();
  return logs.filter(log => log.eventType === eventType);
};

/**
 * Get audit logs within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered log entries
 */
export const getAuditLogsByDateRange = (startDate, endDate) => {
  const logs = getAuditLogs();
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= startDate && logDate <= endDate;
  });
};

/**
 * Export audit logs as JSON file
 */
export const exportAuditLogs = () => {
  try {
    const logs = getAuditLogs();
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `azure-designer-audit-log-${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, count: logs.length };
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export audit logs as CSV file
 */
export const exportAuditLogsCSV = () => {
  try {
    const logs = getAuditLogs();
    
    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'Event Type',
      'Email',
      'Success',
      'Error',
      'User Agent',
      'Platform',
      'Language',
      'Screen Resolution',
      'Session ID'
    ];
    
    // Convert logs to CSV rows
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.eventType,
      log.details.email,
      log.details.success,
      log.details.error || '',
      `"${log.details.userAgent}"`,
      log.details.platform,
      log.details.language,
      log.details.screenResolution,
      log.details.sessionId
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `azure-designer-audit-log-${timestamp}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, count: logs.length };
  } catch (error) {
    console.error('Failed to export audit logs as CSV:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all audit logs
 */
export const clearAuditLogs = () => {
  try {
    localStorage.removeItem(AUDIT_LOG_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear audit logs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get audit statistics
 * @returns {object} Statistics object
 */
export const getAuditStatistics = () => {
  const logs = getAuditLogs();
  
  const stats = {
    total: logs.length,
    byType: {},
    successfulLogins: 0,
    failedLogins: 0,
    successfulSignups: 0,
    failedSignups: 0,
    uniqueUsers: new Set(),
    lastEvent: logs.length > 0 ? logs[logs.length - 1] : null,
    firstEvent: logs.length > 0 ? logs[0] : null
  };
  
  logs.forEach(log => {
    // Count by type
    stats.byType[log.eventType] = (stats.byType[log.eventType] || 0) + 1;
    
    // Count success/failure
    if (log.eventType === 'login' && log.details.success) stats.successfulLogins++;
    if (log.eventType === 'login_failed') stats.failedLogins++;
    if (log.eventType === 'signup' && log.details.success) stats.successfulSignups++;
    if (log.eventType === 'signup_failed') stats.failedSignups++;
    
    // Track unique users
    if (log.details.email) {
      stats.uniqueUsers.add(log.details.email);
    }
  });
  
  stats.uniqueUsers = stats.uniqueUsers.size;
  
  return stats;
};

// Helper functions

/**
 * Generate a unique log ID
 */
const generateLogId = () => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create a session ID for the current browser session
 */
const getOrCreateSessionId = () => {
  const SESSION_KEY = 'azureDesigner_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Format timestamp for display
 * @param {string} isoTimestamp - ISO timestamp string
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (isoTimestamp) => {
  const date = new Date(isoTimestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};
