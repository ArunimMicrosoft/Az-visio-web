// Shared Diagram Viewer — read-only view of a shared diagram via share link
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadSharedDiagram } from '../utils/diagramStorage';
import './SharedDiagram.css';

const SharedDiagram = () => {
  const { shareId } = useParams();
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadSharedDiagram(shareId);
        setDiagram(data);
      } catch (err) {
        setError('Diagram not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareId]);

  if (loading) {
    return (
      <div className="shared-page">
        <div className="shared-loading">Loading shared diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-page">
        <div className="shared-error">
          <h2>😕 {error}</h2>
          <Link to="/" className="shared-home-link">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="shared-header">
        <div className="shared-title">
          <span className="shared-logo">◆</span>
          <h1>{diagram.name}</h1>
          <span className="shared-badge">Read-only</span>
        </div>
        <div className="shared-meta">
          {diagram.item_count} services · {diagram.connection_count} connections
          · Shared from Cloud Canvas Designer
        </div>
      </div>

      <div className="shared-canvas-area">
        <div className="shared-canvas">
          {diagram.items?.map(item => (
            <div
              key={item.id}
              className="shared-item"
              style={{ left: item.x, top: item.y }}
            >
              <div className="shared-item-name">{item.name}</div>
              <div className="shared-item-type">{item.type}</div>
            </div>
          ))}
          {/* SVG connections */}
          <svg className="shared-connections-svg">
            {diagram.connections?.map(conn => {
              const from = diagram.items?.find(i => i.id === conn.from);
              const to = diagram.items?.find(i => i.id === conn.to);
              if (!from || !to) return null;
              return (
                <g key={conn.id}>
                  <line
                    x1={from.x + 60} y1={from.y + 30}
                    x2={to.x + 60} y2={to.y + 30}
                    stroke="#0078d4"
                    strokeWidth="2"
                    strokeDasharray="6,3"
                  />
                  {conn.label && (
                    <text
                      x={(from.x + to.x) / 2 + 60}
                      y={(from.y + to.y) / 2 + 25}
                      fill="#888"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="shared-footer">
        <Link to="/signup" className="shared-cta">Create your own diagrams — Sign up free</Link>
      </div>
    </div>
  );
};

export default SharedDiagram;
