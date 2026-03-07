# 🔍 WHERE ARE AUDIT LOGS STORED? - Complete Guide

**Date**: March 7, 2026  
**Storage Location**: Browser localStorage

---

## 📍 **Storage Location**

### **Primary Storage:**
```
Browser localStorage
Key: 'azureDesigner_audit_log'
Format: JSON array
Max Entries: 1000 (auto-cleanup)
```

### **File Location on Disk:**
Audit logs are **NOT stored as files**. They're stored in your browser's localStorage database:

**Windows (Chrome/Edge):**
```
%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\leveldb\
OR
%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage\leveldb\
```

**Important**: You cannot directly read these files - you must use browser DevTools!

---

## 🖥️ **How to View Audit Logs (4 Methods)**

### **Method 1: Console Commands** ⭐ EASIEST

1. Open the app in browser: http://localhost:5173
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Run any of these commands:

#### View All Logs:
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
console.table(logs);
```

#### View Recent 10 Logs:
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
logs.slice(-10).forEach((log, i) => {
  console.log(`${i+1}. [${log.timestamp}] ${log.eventType} - ${log.details.email}`);
});
```

#### View Detailed Last Log:
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
console.log('Most recent audit log:', logs[logs.length - 1]);
```

#### Count Logs by Type:
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const stats = logs.reduce((acc, log) => {
  acc[log.eventType] = (acc[log.eventType] || 0) + 1;
  return acc;
}, {});
console.table(stats);
```

#### Search for Specific User:
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const userLogs = logs.filter(log => log.details.email === 'demo@azuredesigner.com');
console.table(userLogs);
```

---

### **Method 2: Application Tab** (Visual)

1. Open DevTools (F12)
2. Click **Application** tab (top menu)
3. Left sidebar: Expand **Storage** → **Local Storage**
4. Click your domain: `http://localhost:5173`
5. Look for key: `azureDesigner_audit_log`
6. Click the key to view JSON data in right panel

**Screenshot Guide:**
```
DevTools
├── Application (tab)
│   ├── Storage
│   │   └── Local Storage
│   │       └── http://localhost:5173
│   │           └── azureDesigner_audit_log  ← Click here!
│   │               └── Value: [...logs array...]
```

---

### **Method 3: Export to File** (Recommended for Analysis)

Run this in Console to download logs as a file:

#### Export as JSON:
```javascript
// Copy-paste this entire block into console
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.json`;
a.click();
URL.revokeObjectURL(url);
```

#### Export as CSV:
```javascript
// Copy-paste this entire block into console
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const headers = ['Timestamp', 'Event Type', 'Email', 'Success', 'Error', 'User Agent'];
const rows = logs.map(log => [
  log.timestamp,
  log.eventType,
  log.details.email,
  log.details.success,
  log.details.error || '',
  `"${log.details.userAgent}"`
]);
const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
a.click();
URL.revokeObjectURL(url);
```

---

### **Method 4: Built-in Export Functions** (From Code)

The audit logger has built-in export functions:

```javascript
// In your component/console
import { exportAuditLogs, exportAuditLogsCSV } from './utils/auditLogger';

// Export as JSON
exportAuditLogs();

// Export as CSV
exportAuditLogsCSV();
```

---

## 📊 **Example Log Entry Structure**

```json
{
  "id": "log_1709812845123_abc123xyz",
  "timestamp": "2026-03-07T14:30:45.123Z",
  "eventType": "login",
  "details": {
    "email": "demo@azuredesigner.com",
    "success": true,
    "error": null,
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "platform": "Win32",
    "language": "en-US",
    "screenResolution": "1920x1080",
    "sessionId": "session_1709812800000_xyz789"
  },
  "metadata": {
    "appVersion": "2.0.0",
    "environment": "development"
  }
}
```

---

## 🔍 **Live Demo - Step by Step**

### **See Logs in Real-Time:**

1. **Open the app** (http://localhost:5173)
2. **Open DevTools** (F12) → Console tab
3. **Logout** (if logged in):
   - Click user menu (top right) → Logout
4. **Watch console** - you'll see:
   ```
   🔐 [AUDIT LOG] { eventType: 'logout', ... }
   ```
5. **Login again**:
   - Enter: demo@azuredesigner.com
   - Click "Sign In"
6. **Watch console** - you'll see:
   ```
   🔐 [AUDIT LOG] { eventType: 'login_attempt', ... }
   🔐 [AUDIT LOG] { eventType: 'login', ... }
   ```
7. **Check localStorage**:
   ```javascript
   localStorage.getItem('azureDesigner_audit_log')
   ```

---

## 📈 **Statistics Dashboard**

Get comprehensive statistics about your logs:

```javascript
// Get statistics
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));

const stats = {
  total: logs.length,
  byType: {},
  successfulLogins: 0,
  failedLogins: 0,
  uniqueUsers: new Set()
};

logs.forEach(log => {
  // Count by type
  stats.byType[log.eventType] = (stats.byType[log.eventType] || 0) + 1;
  
  // Count successes/failures
  if (log.eventType === 'login' && log.details.success) stats.successfulLogins++;
  if (log.eventType === 'login_failed') stats.failedLogins++;
  
  // Track unique users
  if (log.details.email) stats.uniqueUsers.add(log.details.email);
});

stats.uniqueUsers = stats.uniqueUsers.size;

console.table(stats);
```

**Example Output:**
```
Total: 25
By Type:
  login_attempt: 10
  login: 9
  login_failed: 1
  signup: 3
  logout: 2
Successful Logins: 9
Failed Logins: 1
Unique Users: 3
```

---

## 🗑️ **Managing Audit Logs**

### **Clear All Logs:**
```javascript
localStorage.removeItem('azureDesigner_audit_log');
```

### **Clear Logs Older Than X Days:**
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

const recentLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
localStorage.setItem('azureDesigner_audit_log', JSON.stringify(recentLogs));

console.log(`Removed ${logs.length - recentLogs.length} old logs`);
```

### **Backup Logs Before Clearing:**
```javascript
// Export first
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `audit-backup-${Date.now()}.json`;
a.click();

// Then clear
localStorage.removeItem('azureDesigner_audit_log');
```

---

## 🔐 **Security Notes**

### **What's Stored:**
✅ Email addresses  
✅ Event types (login, signup, logout)  
✅ Timestamps  
✅ Success/failure status  
✅ Browser information  
✅ Screen resolution  
✅ Session IDs  

### **What's NOT Stored:**
❌ Passwords (NEVER logged!)  
❌ Authentication tokens  
❌ IP addresses (would need server-side)  
❌ Personal data beyond email  

### **Privacy:**
- Logs stored **locally** in browser only
- **Not sent to any server** (unless you implement that)
- **Cleared when browser cache is cleared**
- User can clear manually anytime

---

## 📁 **Storage Limits**

### **localStorage Limits:**
- **Chrome/Edge**: ~10MB per domain
- **Firefox**: ~10MB per domain
- **Safari**: ~5MB per domain

### **Audit Log Size:**
- Average log entry: ~500 bytes
- Max 1000 entries = ~500KB
- Well within browser limits! ✅

---

## 🚨 **Troubleshooting**

### **Problem: "null" returned**
```javascript
localStorage.getItem('azureDesigner_audit_log')
// Returns: null
```

**Solution**: No logs yet! Perform a login/logout to generate logs.

### **Problem: "Cannot read property 'length'"**
**Solution**: Initialize logs first:
```javascript
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log') || '[]');
```

### **Problem: Logs not appearing in console**
**Check:**
1. Are you in **development mode**? (`npm run dev`)
2. Is console open? (F12)
3. Check localStorage directly:
   ```javascript
   localStorage.getItem('azureDesigner_audit_log')
   ```

---

## 🎯 **Quick Commands Reference**

Copy-paste these into console:

```javascript
// VIEW ALL
JSON.parse(localStorage.getItem('azureDesigner_audit_log'))

// VIEW RECENT 5
JSON.parse(localStorage.getItem('azureDesigner_audit_log')).slice(-5)

// COUNT
JSON.parse(localStorage.getItem('azureDesigner_audit_log')).length

// EXPORT JSON
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'audit-logs.json';
a.click();

// CLEAR
localStorage.removeItem('azureDesigner_audit_log');

// STATS
const logs = JSON.parse(localStorage.getItem('azureDesigner_audit_log'));
console.table(logs.reduce((acc, log) => {
  acc[log.eventType] = (acc[log.eventType] || 0) + 1;
  return acc;
}, {}));
```

---

## 📞 **Need Help?**

### **Can't find logs?**
1. Open DevTools (F12)
2. Console tab
3. Type: `localStorage.getItem('azureDesigner_audit_log')`
4. If null, perform a login to generate logs

### **Want to analyze logs?**
1. Export to JSON (see Method 3 above)
2. Open in text editor or Excel
3. Analyze timestamps, patterns, etc.

### **Want server-side logging?**
The current implementation is client-side only. For production, you'd:
1. Create a backend API endpoint (e.g., POST /api/audit-log)
2. Modify `auditLogger.js` to send logs to server
3. Store in database (MongoDB, PostgreSQL, etc.)
4. Add IP tracking, geolocation, etc.

---

## ✅ **Summary**

**Where?** → Browser localStorage (`azureDesigner_audit_log`)  
**How to view?** → DevTools Console or Application tab  
**How to export?** → Console commands (JSON/CSV)  
**How long stored?** → Until browser cache cleared or manually deleted  
**Max entries?** → 1000 (auto-cleanup)  

---

**📍 Key Takeaway**: Audit logs are stored **locally in your browser's localStorage**, not as files on disk. Use DevTools to access them!
