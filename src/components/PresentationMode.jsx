// Presentation Mode — full-screen clean view for stakeholder meetings
import React, { useEffect, useCallback } from 'react';
import './PresentationMode.css';

const PresentationMode = ({ isOpen, onClose, items, connections, boundaries, canvasRef }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const totalServices = items.length;
  const totalConnections = connections.length;
  const totalBoundaries = boundaries.length;
  const serviceTypes = [...new Set(items.map(i => i.serviceType || i.type))];

  return (
    <div className="presentation-overlay">
      <div className="presentation-topbar">
        <div className="presentation-title">
          <span className="presentation-logo">◆</span>
          Azure Architecture Diagram
        </div>
        <div className="presentation-stats">
          <span className="pres-stat">{totalServices} Services</span>
          <span className="pres-stat">{totalConnections} Connections</span>
          {totalBoundaries > 0 && <span className="pres-stat">{totalBoundaries} Boundaries</span>}
        </div>
        <button className="presentation-exit-btn" onClick={onClose} title="Exit (Esc)">
          ✕ Exit
        </button>
      </div>

      <div className="presentation-canvas-wrapper">
        {canvasRef?.current ? (
          <div
            className="presentation-canvas-clone"
            dangerouslySetInnerHTML={{ __html: canvasRef.current.innerHTML }}
          />
        ) : (
          <div className="presentation-empty">No canvas content to display</div>
        )}
      </div>

      <div className="presentation-bottombar">
        <div className="presentation-legend">
          {serviceTypes.slice(0, 8).map(type => (
            <span key={type} className="legend-item">
              <span className="legend-dot" />
              {type}
            </span>
          ))}
          {serviceTypes.length > 8 && (
            <span className="legend-item">+{serviceTypes.length - 8} more</span>
          )}
        </div>
        <div className="presentation-branding">
          Azure Architecture Designer · Press Esc to exit
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;
