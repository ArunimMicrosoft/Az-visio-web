import React, { useState } from 'react';
import './BoundaryCanvas.css';

const boundaryTypeConfig = {
  'resource-group': { name: 'Resource Group', icon: '📦', color: '#0078D4', style: 'solid' },
  'subscription': { name: 'Subscription', icon: '🎫', color: '#5C2D91', style: 'solid' },
  'virtual-network': { name: 'Virtual Network', icon: '🔷', color: '#008272', style: 'solid' },
  'subnet': { name: 'Subnet', icon: '🔸', color: '#00BCF2', style: 'dashed' },
  'region': { name: 'Region', icon: '🌍', color: '#FF6C37', style: 'solid' },
  'availability-zone': { name: 'Availability Zone', icon: '🏢', color: '#FFB900', style: 'solid' },
  'availability-set': { name: 'Availability Set', icon: '🔄', color: '#50E6FF', style: 'dashed' },
  'security-boundary': { name: 'Security Boundary', icon: '🔒', color: '#E81123', style: 'solid' },
  'nsg-boundary': { name: 'NSG Boundary', icon: '🛡️', color: '#FF8C00', style: 'dotted' },
  'application': { name: 'Application', icon: '📱', color: '#107C10', style: 'solid' },
  'text-annotation': { name: 'Text Note', icon: '📝', color: '#FFD700', style: 'none' }
};

const BoundaryCanvas = ({ boundaries, setBoundaries, items, boundaryDrawMode, drawingBoundary, setDrawingBoundary, boundaryType }) => {
  const [selectedBoundary, setSelectedBoundary] = useState(null);
  const [draggingBoundary, setDraggingBoundary] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingBoundary, setResizingBoundary] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const [editingBoundaryId, setEditingBoundaryId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const inputRef = React.useRef(null);
  
  // Start editing boundary name
  const startEditingBoundaryName = (boundaryId, currentLabel) => {
    setEditingBoundaryId(boundaryId);
    setEditingLabel(currentLabel);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Save edited boundary name
  const saveBoundaryName = () => {
    if (editingBoundaryId && editingLabel.trim()) {
      setBoundaries(boundaries.map(b =>
        b.id === editingBoundaryId ? { ...b, label: editingLabel.trim() } : b
      ));
    }
    setEditingBoundaryId(null);
    setEditingLabel('');
  };

  // Cancel editing
  const cancelEditingBoundaryName = () => {
    setEditingBoundaryId(null);
    setEditingLabel('');
  };

  // Handle keyboard events for boundary name editing
  const handleBoundaryNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveBoundaryName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingBoundaryName();
    }
  };
  
  // Start drawing boundary
  const handleDrawStart = (e) => {
    if (!boundaryDrawMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;

    const config = boundaryTypeConfig[boundaryType];
    setDrawingBoundary({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      type: boundaryType,
      ...config
    });
  };

  // Continue drawing boundary (SMOOTH)
  const handleDrawMove = (e) => {
    if (!drawingBoundary) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      setDrawingBoundary({
        ...drawingBoundary,
        currentX: x,
        currentY: y
      });
    });
  };
  // Finish drawing boundary
  const handleDrawEnd = (e) => {
    if (!drawingBoundary) return;

    e.preventDefault();
    e.stopPropagation();

    const { startX, startY, currentX, currentY, type, name, icon, color, style } = drawingBoundary;
    
    // Calculate final position and size
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    // Only create boundary if it has minimum size (30x30 instead of 50x50 for easier drawing)
    if (width > 30 && height > 30) {
      const newBoundary = {
        id: Date.now(),
        type,
        name,
        icon,
        color,
        style: style || 'solid',
        x,
        y,
        width,
        height,
        label: `${name} ${boundaries.length + 1}`
      };

      setBoundaries([...boundaries, newBoundary]);
      console.log('Boundary created:', newBoundary);
    } else {
      console.log('Boundary too small - minimum 30x30 pixels required');
    }

    setDrawingBoundary(null);
  };

  // Handle boundary drop from toolbar (keeping for compatibility)
  const handleBoundaryDrop = (e) => {
    e.preventDefault();
    const boundaryData = e.dataTransfer.getData('boundary');
    
    if (boundaryData) {
      try {
        const boundary = JSON.parse(boundaryData);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newBoundary = {
          id: Date.now(),
          ...boundary,
          x: x - 150,
          y: y - 75,
          width: 300,
          height: 200,
          label: `${boundary.name} 1`
        };

        setBoundaries([...boundaries, newBoundary]);
      } catch (error) {
        console.error('Error parsing boundary data:', error);
      }
    }
  };
  // Start dragging boundary
  const handleBoundaryMouseDown = (e, boundary) => {
    e.stopPropagation();
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;
    
    if (e.target.classList.contains('boundary-header') || e.target.closest('.boundary-header')) {
      setSelectedBoundary(boundary.id);
      setDraggingBoundary(boundary.id);
      setDragOffset({
        x: e.clientX - rect.left + scrollLeft - boundary.x,
        y: e.clientY - rect.top + scrollTop - boundary.y
      });
      console.log('Started dragging boundary:', boundary.label);
    }
  };

  // Start resizing boundary
  const handleResizeStart = (e, boundary, handle) => {
    e.stopPropagation();
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
    const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;
    
    setResizingBoundary(boundary.id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: boundary.width,
      height: boundary.height,
      boundaryX: boundary.x,
      boundaryY: boundary.y,
      handle,
      scrollLeft,
      scrollTop
    });
    console.log('Started resizing boundary:', boundary.label, 'handle:', handle);
  };
  // Handle mouse move for dragging and resizing (SMOOTH)
  const handleMouseMove = (e) => {
    e.preventDefault();
    
    if (draggingBoundary) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollLeft = e.currentTarget.parentElement?.scrollLeft || 0;
      const scrollTop = e.currentTarget.parentElement?.scrollTop || 0;
      
      const newX = e.clientX - rect.left + scrollLeft - dragOffset.x;
      const newY = e.clientY - rect.top + scrollTop - dragOffset.y;

      requestAnimationFrame(() => {
        setBoundaries(boundaries.map(b =>
          b.id === draggingBoundary
            ? { ...b, x: Math.max(0, newX), y: Math.max(0, newY) }
            : b
        ));
      });
    }

    if (resizingBoundary && resizeStart) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      requestAnimationFrame(() => {
        setBoundaries(boundaries.map(b => {
          if (b.id !== resizingBoundary) return b;

          let newWidth = resizeStart.width;
          let newHeight = resizeStart.height;
          let newX = resizeStart.boundaryX;
          let newY = resizeStart.boundaryY;

          // Minimum sizes for better UX
          const minWidth = 100;
          const minHeight = 80;

          switch (resizeStart.handle) {
            case 'se': // Bottom-right
              newWidth = Math.max(minWidth, resizeStart.width + deltaX);
              newHeight = Math.max(minHeight, resizeStart.height + deltaY);
              break;
            case 'sw': // Bottom-left
              newWidth = Math.max(minWidth, resizeStart.width - deltaX);
              newHeight = Math.max(minHeight, resizeStart.height + deltaY);
              if (resizeStart.width - deltaX >= minWidth) {
                newX = resizeStart.boundaryX + deltaX;
              }
              break;
            case 'ne': // Top-right
              newWidth = Math.max(minWidth, resizeStart.width + deltaX);
              newHeight = Math.max(minHeight, resizeStart.height - deltaY);
              if (resizeStart.height - deltaY >= minHeight) {
                newY = resizeStart.boundaryY + deltaY;
              }
              break;
            case 'nw': // Top-left
              newWidth = Math.max(minWidth, resizeStart.width - deltaX);
              newHeight = Math.max(minHeight, resizeStart.height - deltaY);
              if (resizeStart.width - deltaX >= minWidth) {
                newX = resizeStart.boundaryX + deltaX;
              }
              if (resizeStart.height - deltaY >= minHeight) {
                newY = resizeStart.boundaryY + deltaY;
              }
              break;
            default:
              break;
          }          return {
            ...b,
            x: Math.max(0, newX),
            y: Math.max(0, newY),
            width: newWidth,
            height: newHeight
          };
        }));
      });
    }
  };
  // Handle mouse up
  const handleMouseUp = () => {
    if (draggingBoundary) {
      console.log('Finished dragging boundary');
    }
    if (resizingBoundary) {
      console.log('Finished resizing boundary');
    }
    setDraggingBoundary(null);
    setResizingBoundary(null);
    setResizeStart(null);
  };
  // Delete boundary
  const handleDeleteBoundary = (boundaryId) => {
    setBoundaries(boundaries.filter(b => b.id !== boundaryId));
    setSelectedBoundary(null);
  };

  // Count items inside boundary
  const countItemsInBoundary = (boundary) => {
    return items.filter(item =>
      item.x >= boundary.x &&
      item.x <= boundary.x + boundary.width &&
      item.y >= boundary.y &&
      item.y <= boundary.y + boundary.height
    ).length;
  };return (
    <div
      className={`boundary-layer ${boundaryDrawMode ? 'drawing-mode' : ''}`}
      onMouseDown={boundaryDrawMode ? handleDrawStart : undefined}
      onMouseMove={boundaryDrawMode ? handleDrawMove : handleMouseMove}
      onMouseUp={boundaryDrawMode ? handleDrawEnd : handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleBoundaryDrop}
      style={{ 
        cursor: boundaryDrawMode ? 'crosshair' : 'default'
        // pointer-events controlled by CSS:
        //   .boundary-layer = none (transparent, clicks pass to canvas items)
        //   .boundary-layer.drawing-mode = auto (captures draw events)
        //   .boundary elements themselves always have pointer-events: auto
      }}
    >
      {/* Drawing boundary preview */}
      {drawingBoundary && (
        <div
          className="boundary drawing"
          style={{
            left: `${Math.min(drawingBoundary.startX, drawingBoundary.currentX)}px`,
            top: `${Math.min(drawingBoundary.startY, drawingBoundary.currentY)}px`,
            width: `${Math.abs(drawingBoundary.currentX - drawingBoundary.startX)}px`,
            height: `${Math.abs(drawingBoundary.currentY - drawingBoundary.startY)}px`,
            borderColor: drawingBoundary.color,
            opacity: 0.5,
            pointerEvents: 'none'
          }}
        >
          <div className="boundary-header" style={{ backgroundColor: drawingBoundary.color }}>
            <span className="boundary-icon">{drawingBoundary.icon}</span>
            <span className="boundary-label">{drawingBoundary.name}</span>
          </div>
        </div>
      )}      {/* Existing boundaries */}
      {boundaries.map(boundary => {
        const itemCount = countItemsInBoundary(boundary);
        const config = boundaryTypeConfig[boundary.type] || {};
        const borderStyle = config.style || 'solid';
        const isTextAnnotation = boundary.type === 'text-annotation';
        
        return (          <div
            key={boundary.id}
            className={`boundary ${selectedBoundary === boundary.id ? 'selected' : ''} ${editingBoundaryId === boundary.id ? 'editing' : ''} ${boundary.type}`}
            style={{
              left: `${boundary.x}px`,
              top: `${boundary.y}px`,
              width: `${boundary.width}px`,
              height: `${boundary.height}px`,
              borderColor: boundary.color,
              borderStyle: borderStyle,
              borderWidth: isTextAnnotation ? '0' : '2px',
              backgroundColor: isTextAnnotation ? boundary.color + '22' : 'transparent',
              pointerEvents: 'auto',
              zIndex: editingBoundaryId === boundary.id ? 999 : 'auto'
            }}
            onClick={() => setSelectedBoundary(boundary.id)}
          >
            {/* Header */}            <div
              className={`boundary-header ${isTextAnnotation ? 'text-annotation-header' : ''} ${editingBoundaryId === boundary.id ? 'editing' : ''}`}
              style={{ backgroundColor: isTextAnnotation ? 'transparent' : boundary.color }}
              onMouseDown={(e) => {
                // Don't start dragging when clicking on the label for editing
                if (!e.target.classList.contains('boundary-label')) {
                  handleBoundaryMouseDown(e, boundary);
                }
              }}
            >
              <span className="boundary-icon">{boundary.icon}</span>              {editingBoundaryId === boundary.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  className={`boundary-label boundary-label-input ${isTextAnnotation ? 'text-annotation-label' : ''}`}
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  onKeyDown={handleBoundaryNameKeyDown}
                  onBlur={saveBoundaryName}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  style={{
                    color: isTextAnnotation ? '#333' : '#333',
                    fontSize: isTextAnnotation ? '16px' : '13px',
                    fontWeight: isTextAnnotation ? '500' : '600',
                    backgroundColor: 'white',
                    cursor: 'text'
                  }}
                />
              ) : (
                <input
                  type="text"
                  className={`boundary-label ${isTextAnnotation ? 'text-annotation-label' : ''}`}
                  value={boundary.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    startEditingBoundaryName(boundary.id, boundary.label);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  readOnly
                  style={{
                    color: isTextAnnotation ? '#333' : 'white',
                    fontSize: isTextAnnotation ? '16px' : '13px',
                    fontWeight: isTextAnnotation ? '500' : '600',
                    cursor: 'text',
                    pointerEvents: 'auto'
                  }}
                />
              )}
              {!isTextAnnotation && (
                <span className="boundary-item-count">
                  {itemCount} {itemCount === 1 ? 'service' : 'services'}
                </span>
              )}
              {selectedBoundary === boundary.id && (
                <button
                  className="boundary-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBoundary(boundary.id);
                  }}
                  title="Delete boundary"
                  style={{ color: isTextAnnotation ? '#E81123' : 'white' }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Resize handles */}
            {selectedBoundary === boundary.id && (
              <>
                <div
                  className="resize-handle resize-se"
                  onMouseDown={(e) => handleResizeStart(e, boundary, 'se')}
                  title="Resize"
                />
                <div
                  className="resize-handle resize-sw"
                  onMouseDown={(e) => handleResizeStart(e, boundary, 'sw')}
                  title="Resize"
                />
                <div
                  className="resize-handle resize-ne"
                  onMouseDown={(e) => handleResizeStart(e, boundary, 'ne')}
                  title="Resize"
                />
                <div
                  className="resize-handle resize-nw"
                  onMouseDown={(e) => handleResizeStart(e, boundary, 'nw')}
                  title="Resize"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BoundaryCanvas;
