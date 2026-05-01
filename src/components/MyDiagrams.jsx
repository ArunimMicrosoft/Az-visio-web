// My Diagrams — cloud-saved diagrams dashboard
import React, { useState, useEffect } from 'react';
import { listUserDiagrams, saveDiagramToCloud, loadDiagramFromCloud, deleteDiagramFromCloud, renameDiagram } from '../utils/diagramStorage';
import { trackCloudSave } from '../utils/activityTracker';
import './MyDiagrams.css';

const MyDiagrams = ({ isOpen, onClose, userId, currentDiagram, onLoadDiagram, onSaveComplete, subscriptionTier }) => {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchDiagrams();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  const fetchDiagrams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUserDiagrams(userId);
      setDiagrams(data);
    } catch (err) {
      setError('Failed to load diagrams. The diagrams table may not exist yet in Supabase.');
      console.error('Fetch diagrams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentDiagram || currentDiagram.items.length === 0) {
      setError('Canvas is empty — add services before saving.');
      return;
    }
    // Starter: max 10 cloud saves
    if (subscriptionTier === 'starter' && diagrams.length >= 10) {
      setError('Starter plan allows up to 10 cloud diagrams. Upgrade to Professional for unlimited.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await saveDiagramToCloud(userId, {
        name: saveName.trim() || undefined,
        ...currentDiagram,
      });
      setSaveName('');
      await fetchDiagrams();
      trackCloudSave(userId);
      if (onSaveComplete) onSaveComplete(saved);
    } catch (err) {
      setError('Failed to save. Check that the diagrams table exists in Supabase.');
      console.error('Save diagram error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (diagramId) => {
    try {
      const diagram = await loadDiagramFromCloud(diagramId, userId);
      onLoadDiagram(diagram);
      onClose();
    } catch (err) {
      setError('Failed to load diagram.');
      console.error('Load diagram error:', err);
    }
  };

  const handleDelete = async (diagramId) => {
    if (!window.confirm('Delete this diagram permanently?')) return;
    try {
      await deleteDiagramFromCloud(diagramId, userId);
      await fetchDiagrams();
    } catch (err) {
      setError('Failed to delete diagram.');
    }
  };

  const handleRename = async (diagramId) => {
    if (!editName.trim()) return;
    try {
      await renameDiagram(diagramId, userId, editName.trim());
      setEditingId(null);
      setEditName('');
      await fetchDiagrams();
    } catch (err) {
      setError('Failed to rename diagram.');
    }
  };

  const copyShareLink = (shareId) => {
    const url = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="mydiag-overlay" onClick={onClose}>
      <div className="mydiag-modal" onClick={e => e.stopPropagation()}>
        <div className="mydiag-header">
          <h2>☁️ My Diagrams</h2>
          <button className="mydiag-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="mydiag-save-row">
          <input
            type="text"
            className="mydiag-name-input"
            placeholder="Diagram name..."
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="mydiag-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving...' : '☁️ Save to Cloud'}
          </button>
        </div>

        {error && <div className="mydiag-error">{error}</div>}

        <div className="mydiag-list">
          {loading ? (
            <div className="mydiag-loading">Loading diagrams...</div>
          ) : diagrams.length === 0 ? (
            <div className="mydiag-empty">No saved diagrams yet. Save your first diagram to the cloud.</div>
          ) : (
            diagrams.map(d => (
              <div key={d.id} className="mydiag-item">
                <div className="mydiag-item-info">
                  {editingId === d.id ? (
                    <div className="mydiag-edit-row">
                      <input
                        className="mydiag-edit-input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRename(d.id)}
                        autoFocus
                      />
                      <button className="mydiag-edit-ok" onClick={() => handleRename(d.id)}>✓</button>
                      <button className="mydiag-edit-cancel" onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  ) : (
                    <span className="mydiag-item-name">{d.name}</span>
                  )}
                  <span className="mydiag-item-meta">
                    {d.item_count} services · {d.connection_count} connections · {formatDate(d.updated_at)}
                  </span>
                </div>
                <div className="mydiag-item-actions">
                  <button onClick={() => handleLoad(d.id)} title="Load diagram">📂</button>
                  <button onClick={() => { setEditingId(d.id); setEditName(d.name); }} title="Rename">✏️</button>
                  <button onClick={() => copyShareLink(d.share_id)} title="Copy share link">🔗</button>
                  <button onClick={() => handleDelete(d.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDiagrams;
