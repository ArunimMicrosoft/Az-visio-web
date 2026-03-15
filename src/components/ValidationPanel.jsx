import React, { useState, useEffect } from 'react';
import { validateArchitecture, scoreWAF } from '../utils/azureArchitectureValidator';
import './ValidationPanel.css';

const ValidationPanel = ({ items, connections, boundaries, isOpen, onClose }) => {
  const [validation, setValidation] = useState(null);
  const [waf, setWaf] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const run = () => {
      if (items.length > 0) {
        setValidation(validateArchitecture(items, connections, boundaries));
        setWaf(scoreWAF(items));
      } else {
        setValidation(null);
        setWaf(null);
      }
    };
    if (isOpen) run();
  }, [items, connections, boundaries, isOpen]);

  if (!isOpen || !validation) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
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

        <div className="validation-score-card">
          <div className="score-circle" style={{ borderColor: getScoreColor(validation.score) }}>
            <div className="score-value" style={{ color: getScoreColor(validation.score) }}>{validation.score}</div>
            <div className="score-grade">{getScoreGrade(validation.score)}</div>
          </div>
          <div className="score-details">
            <h3>{validation.isValid ? '✅ Ready for Deployment' : '❌ Deployment Issues Found'}</h3>
            <div className="score-stats">
              <span className="stat">📊 {validation.summary.total} Services</span>
              <span className="stat error">🔴 {validation.summary.errors} Errors</span>
              <span className="stat warning">🟡 {validation.summary.warnings}</span>
              <span className="stat info">💡 {validation.summary.recommendations} Tips</span>
            </div>
          </div>
        </div>

        <div className="validation-tabs">
          {[
            { id: 'summary',         label: '📋 Summary' },
            { id: 'errors',          label: `🔴 Errors (${validation.summary.errors})` },
            { id: 'warnings',        label: `🟡 Warnings (${validation.summary.warnings})` },
            { id: 'recommendations', label: `💡 Tips (${validation.summary.recommendations})` },
            { id: 'waf',             label: '🏛️ WAF Score' },
          ].map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

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
                    <p className="warning-note">⚠️ Consider reviewing {validation.warnings.length} warning(s) for production optimization.</p>
                  )}
                </div>
              ) : (
                <div className="error-message">
                  <div className="error-icon">❌</div>
                  <h4>Deployment Issues Detected</h4>
                  <p>Your architecture has {validation.errors.length} critical error(s) that must be fixed before deployment.</p>
                  <ul className="issue-list">
                    {validation.errors.slice(0, 5).map((error, idx) => (
                      <li key={idx}><strong>{error.serviceName}</strong>: {error.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="errors-tab">
              {validation.errors.length === 0 ? (
                <div className="no-issues"><div className="no-issues-icon">✅</div><p>No critical errors found!</p></div>
              ) : (
                <div className="issues-list">
                  {validation.errors.map((error, idx) => (
                    <div key={idx} className="issue-card error">
                      <div className="issue-header">
                        <span className="issue-icon">🔴</span>
                        <strong>{error.serviceName || 'Unknown Service'}</strong>
                      </div>
                      <p className="issue-message">{error.message}</p>
                      {error.invalidConnection && (
                        <div className="invalid-connection-details">
                          <div className="connection-flow">
                            <span className="connection-service">{error.invalidConnection.fromName}</span>
                            <span className="connection-arrow">→</span>
                            <span className="connection-service error">{error.invalidConnection.toName}</span>
                          </div>
                          <p className="connection-reason"><strong>Why this fails:</strong> {error.invalidConnection.reason}</p>
                        </div>
                      )}
                      <div className="issue-meta">
                        <span className="issue-type">{error.type.replace(/_/g, ' ')}</span>
                        {error.missingServices && <span className="issue-missing">Missing: {error.missingServices.join(', ')}</span>}
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
                <div className="no-issues"><div className="no-issues-icon">✅</div><p>No warnings!</p></div>
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
                        {warning.category && <span className="issue-category">Category: {warning.category}</span>}
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
                <div className="no-issues"><div className="no-issues-icon">🎉</div><p>No additional recommendations.</p></div>
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

          {activeTab === 'waf' && (
            <div className="waf-tab">
              {!waf ? (
                <div className="no-issues"><p>Add services to see WAF scores.</p></div>
              ) : (
                <>
                  <div className="waf-overall">
                    <div className="waf-overall-score" style={{ borderColor: getScoreColor(waf.overall) }}>
                      <div className="score-value" style={{ color: getScoreColor(waf.overall) }}>{waf.overall}</div>
                      <div className="score-label">Overall</div>
                    </div>
                    <div className="waf-overall-info">
                      <h4>Azure Well-Architected Framework</h4>
                      <p>Scored across 5 pillars based on services detected in your diagram.</p>
                      <a href="https://learn.microsoft.com/en-us/azure/well-architected/" target="_blank" rel="noopener noreferrer" className="waf-learn-link">WAF Documentation →</a>
                    </div>
                  </div>
                  <div className="waf-pillars-grid">
                    {[
                      { key: 'reliability',  label: 'Reliability',            icon: '🛡️', color: '#10b981' },
                      { key: 'security',     label: 'Security',               icon: '🔐', color: '#ef4444' },
                      { key: 'cost',         label: 'Cost Optimization',      icon: '💸', color: '#f59e0b' },
                      { key: 'operations',   label: 'Operational Excellence', icon: '⚙️', color: '#8b5cf6' },
                      { key: 'performance',  label: 'Performance Efficiency', icon: '⚡', color: '#0078D4' },
                    ].map(({ key, label, icon, color }) => (
                      <div key={key} className="waf-pillar-card">
                        <div className="waf-pillar-header">
                          <span className="waf-pillar-icon">{icon}</span>
                          <span className="waf-pillar-label">{label}</span>
                          <span className="waf-pillar-score" style={{ color }}>{waf.scores[key]}</span>
                        </div>
                        <div className="waf-pillar-bar">
                          <div className="waf-pillar-bar-fill" style={{ width: `${waf.scores[key]}%`, background: color }} />
                        </div>
                        <ul className="waf-pillar-findings">
                          {waf.findings[key].map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        <div className="validation-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          {validation.isValid
            ? <button className="btn-success" onClick={onClose}>✅ Proceed to Export</button>
            : <button className="btn-danger" disabled>❌ Fix Errors Before Export</button>
          }
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
