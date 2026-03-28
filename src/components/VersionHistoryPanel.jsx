// Version History Panel — shows saved snapshots with restore/delete
import React, { useState } from 'react';
import './VersionHistoryPanel.css';

const VersionHistoryPanel = ({ versions, onSave, onRestore, onDelete, isOpen, onClose }) => {
  const [versionName, setVersionName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(versionName.trim() || undefined);
    setVersionName('');
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="version-panel-overlay" onClick={onClose}>
      <div className="version-panel" onClick={e => e.stopPropagation()}>
        <div className="version-panel-header">
          <h3>📋 Version History</h3>
          <button className="version-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="version-save-row">
          <input
            type="text"
            className="version-name-input"
            placeholder="Version name (optional)"
            value={versionName}
            onChange={e => setVersionName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="version-save-btn" onClick={handleSave}>
            💾 Save Snapshot
          </button>
        </div>

        <div className="version-list">
          {versions.length === 0 ? (
            <div className="version-empty">No versions saved yet. Save a snapshot to track changes.</div>
          ) : (
            versions.map(v => (
              <div key={v.id} className="version-item">
                <div className="version-info">
                  <span className="version-name">{v.name}</span>
                  <span className="version-meta">
                    {formatTime(v.timestamp)} · {v.itemCount} services · {v.connectionCount} connections
                  </span>
                </div>
                <div className="version-actions">
                  <button
                    className="version-restore-btn"
                    onClick={() => onRestore(v.id)}
                    title="Restore this version"
                  >
                    ↩️
                  </button>
                  <button
                    className="version-delete-btn"
                    onClick={() => onDelete(v.id)}
                    title="Delete this version"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryPanel;
