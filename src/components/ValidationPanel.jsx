import React, { useState, useEffect } from 'react';
import { validateArchitecture } from '../utils/azureArchitectureValidator';
import './ValidationPanel.css';

const ValidationPanel = ({ items, connections, isOpen, onClose }) => {
  const [validation, setValidation] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    // Run validation when panel opens or data changes
    const runValidation = () => {
      if (items.length > 0) {
        const result = validateArchitecture(items, connections);
        setValidation(result);
      } else {
        setValidation(null);
      }
    };

    if (isOpen) {
      runValidation();
    }
  }, [items, connections, isOpen]);

  if (!isOpen || !validation) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="validation-overlay">
      <div className="validation-panel">
        <div className="validation-header">
          <h2>🔍 Architecture Validation Report</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Score Card */}
        <div className="validation-score-card">
          <div className="score-circle" style={{ borderColor: getScoreColor(validation.score) }}>
            <div className="score-value" style={{ color: getScoreColor(validation.score) }}>
              {validation.score}
            </div>
            <div className="score-grade">{getScoreGrade(validation.score)}</div>
          </div>
          <div className="score-details">
            <h3>{validation.isValid ? '✅ Ready for Deployment' : '❌ Deployment Issues Found'}</h3>
            <div className="score-stats">
              <span className="stat">📊 {validation.summary.total} Services</span>
              <span className="stat error">🔴 {validation.summary.errors} Errors</span>
              <span className="stat warning">🟡 {validation.summary.warnings} Warnings</span>
              <span className="stat info">💡 {validation.summary.recommendations} Tips</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="validation-tabs">
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            📋 Summary
          </button>
          <button 
            className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            🔴 Errors ({validation.summary.errors})
          </button>
          <button 
            className={`tab ${activeTab === 'warnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('warnings')}
          >
            🟡 Warnings ({validation.summary.warnings})
          </button>
          <button 
            className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            💡 Tips ({validation.summary.recommendations})
          </button>
        </div>

        {/* Content */}
        <div className="validation-content">
          {activeTab === 'summary' && (
            <div className="summary-tab">
              <h3>Deployment Readiness Summary</h3>
              {validation.isValid ? (
                <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h4>Architecture Looks Good!</h4>
                  <p>Your Azure architecture follows deployment best practices and should deploy successfully.</p>
                  {validation.warnings.length > 0 && (
                    <p className="warning-note">
                      ⚠️ Consider reviewing {validation.warnings.length} warning(s) for production optimization.
                    </p>
                  )}
                </div>
              ) : (
                <div className="error-message">
                  <div className="error-icon">❌</div>
                  <h4>Deployment Issues Detected</h4>
                  <p>Your architecture has {validation.errors.length} critical error(s) that must be fixed before deployment.</p>
                  <ul className="issue-list">
                    {validation.errors.slice(0, 5).map((error, idx) => (
                      <li key={idx}>
                        <strong>{error.serviceName}</strong>: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="errors-tab">
              {validation.errors.length === 0 ? (
                <div className="no-issues">
                  <div className="no-issues-icon">✅</div>
                  <p>No critical errors found! Your architecture is ready for deployment.</p>
                </div>
              ) : (
                <div className="issues-list">
                  {validation.errors.map((error, idx) => (
                    <div key={idx} className="issue-card error">
                      <div className="issue-header">
                        <span className="issue-icon">🔴</span>
                        <strong>{error.serviceName || 'Unknown Service'}</strong>
                      </div>
                      <p className="issue-message">{error.message}</p>
                      <div className="issue-meta">
                        <span className="issue-type">{error.type.replace(/_/g, ' ')}</span>
                        {error.missingServices && (
                          <span className="issue-missing">
                            Missing: {error.missingServices.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'warnings' && (
            <div className="warnings-tab">
              {validation.warnings.length === 0 ? (
                <div className="no-issues">
                  <div className="no-issues-icon">✅</div>
                  <p>No warnings! Your architecture follows best practices.</p>
                </div>
              ) : (
                <div className="issues-list">
                  {validation.warnings.map((warning, idx) => (
                    <div key={idx} className="issue-card warning">
                      <div className="issue-header">
                        <span className="issue-icon">🟡</span>
                        <strong>{warning.serviceName || 'Unknown Service'}</strong>
                      </div>
                      <p className="issue-message">{warning.message}</p>
                      <div className="issue-meta">
                        <span className="issue-type">{warning.type.replace(/_/g, ' ')}</span>
                        {warning.category && (
                          <span className="issue-category">Category: {warning.category}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="recommendations-tab">
              {validation.recommendations.length === 0 ? (
                <div className="no-issues">
                  <div className="no-issues-icon">🎉</div>
                  <p>Perfect! No additional recommendations.</p>
                </div>
              ) : (
                <div className="issues-list">
                  {validation.recommendations.map((rec, idx) => (
                    <div key={idx} className="issue-card recommendation">
                      <div className="issue-header">
                        <span className="issue-icon">💡</span>
                        <strong>{rec.serviceName || 'Architecture'}</strong>
                      </div>
                      <p className="issue-message">{rec.message}</p>
                      <div className="issue-meta">
                        <span className="issue-category">Category: {rec.category || 'general'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="validation-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          {validation.isValid && (
            <button className="btn-success">
              ✅ Proceed to Export
            </button>
          )}
          {!validation.isValid && (
            <button className="btn-danger" disabled>
              ❌ Fix Errors Before Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
