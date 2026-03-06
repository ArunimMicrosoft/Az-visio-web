import React, { useState, useRef, useEffect } from 'react';
import './AzureIcon.css';

const AzureIcon = ({ icon, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragClone = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchStartTime = useRef(0);
  const hasMoved = useRef(false);

  // Detect if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768);
  };

  // Desktop drag handlers
  const handleDragStart = (e) => {
    e.dataTransfer.setData('azureIcon', JSON.stringify(icon));
    if (onDragStart) onDragStart(icon);
  };
  // Mobile: Simple click to add icon to canvas
  const handleMobileClick = () => {
    if (isMobileDevice() && !hasMoved.current) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Dispatch event to add icon to canvas center
      const customEvent = new CustomEvent('iconMobileClick', {
        detail: { icon }
      });
      document.dispatchEvent(customEvent);
    }
  };

  // Mobile touch handlers - only for tracking, not dragging
  const handleTouchStart = (e) => {
    touchStartTime.current = Date.now();
    hasMoved.current = false;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const moveDistance = Math.sqrt(
      Math.pow(touch.clientX - touchStartPos.current.x, 2) +
      Math.pow(touch.clientY - touchStartPos.current.y, 2)
    );
    
    // If moved more than 10px, consider it a scroll not a click
    if (moveDistance > 10) {
      hasMoved.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    const touchDuration = Date.now() - touchStartTime.current;
    
    // If it was a quick tap (less than 300ms) and didn't move much
    if (touchDuration < 300 && !hasMoved.current) {
      e.preventDefault();
      handleMobileClick();
    }
    
    setIsDragging(false);
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    hasMoved.current = false;
  };
  // Cleanup on unmount
  useEffect(() => {
    const clone = dragClone.current;
    return () => {
      if (clone) {
        clone.remove();
      }
    };
  }, []);
  return (
    <div
      className={`azure-icon ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      title={icon.name}
    >
      <div className="icon-symbol">
        <img 
          src={encodeURI(icon.path)} 
          alt={icon.name} 
          className="icon-image"
          onError={(e) => {
            console.error('Failed to load icon:', icon.path);
            e.target.style.display = 'none';
          }}
        />
      </div>
      <span className="icon-label">{icon.name}</span>
    </div>
  );
};

export default AzureIcon;
