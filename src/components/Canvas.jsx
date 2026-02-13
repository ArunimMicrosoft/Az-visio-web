import React, { useState, useRef, useEffect } from 'react';
import { validateConnection, getConnectionMessage } from '../utils/connectionValidator';
import './Canvas.css';

const Canvas = ({ items, setItems, connections, setConnections, canvasRef }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const localCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Use passed ref or local ref
  const activeCanvasRef = canvasRef || localCanvasRef;

  const handleDragOver = (e) => {
    e.preventDefault();
  };  const handleDrop = (e) => {
    e.preventDefault();
    const iconData = e.dataTransfer.getData('azureIcon');
    
    if (iconData) {
      const icon = JSON.parse(iconData);
      const rect = activeCanvasRef.current.getBoundingClientRect();
      
      // Calculate position with scroll offset
      const scrollLeft = containerRef.current.scrollLeft;
      const scrollTop = containerRef.current.scrollTop;
      
      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      const newItem = {
        id: Date.now(),
        ...icon,
        x: x - 40,
        y: y - 40,
      };

      setItems([...items, newItem]);
    }
  };

  const startConnection = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectionMode(true);
    setConnectingFrom(item.id);
  };

  const completeConnection = (e, item) => {
    if (connectionMode && connectingFrom && connectingFrom !== item.id) {
      const fromItem = items.find(i => i.id === connectingFrom);
      const toItem = item;
      
      const validationStatus = validateConnection(fromItem.id, toItem.id);
      
      setConnections([...connections, { 
        from: connectingFrom, 
        to: item.id,
        status: validationStatus 
      }]);
      
      setConnectionMode(false);
      setConnectingFrom(null);
    }
  };
  const startDragging = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item.id);
    setIsDragging(true);
    const rect = activeCanvasRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - item.x,
      y: e.clientY - rect.top + scrollTop - item.y,
    });
  };
  const handleMouseMove = (e) => {
    const rect = activeCanvasRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    setMousePos({
      x: e.clientX - rect.left + scrollLeft,
      y: e.clientY - rect.top + scrollTop
    });

    if (isDragging && selectedItem) {
      const x = e.clientX - rect.left + scrollLeft - dragOffset.x;
      const y = e.clientY - rect.top + scrollTop - dragOffset.y;

      setItems(items.map(item =>
        item.id === selectedItem ? { ...item, x, y } : item
      ));
    }
  };

  const handleMouseUp = () => {
    if (!connectionMode) {
      setIsDragging(false);
    }
  };

  const handleCanvasClick = () => {
    if (connectionMode) {
      setConnectionMode(false);
      setConnectingFrom(null);
    }
  };

  const handleDeleteItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    setConnections(connections.filter(conn => conn.from !== itemId && conn.to !== itemId));
    setSelectedItem(null);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedItem) {
        setItems(prevItems => prevItems.filter(item => item.id !== selectedItem));
        setConnections(prevConns => prevConns.filter(conn => conn.from !== selectedItem && conn.to !== selectedItem));
        setSelectedItem(null);
      }
      if (e.key === 'Escape' && connectionMode) {
        setConnectionMode(false);
        setConnectingFrom(null);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const currentRef = activeCanvasRef.current;

    window.addEventListener('keydown', handleKeyDown);
    currentRef?.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      currentRef?.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [selectedItem, setItems, setConnections, connectionMode, activeCanvasRef]);

  const getItemCenter = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return { x: 0, y: 0 };
    return { x: item.x + 40, y: item.y + 40 };
  };
  return (
    <div ref={containerRef} className="canvas-container">
      <div
        ref={activeCanvasRef}
        className="canvas"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {connectionMode && (
          <div className="connecting-status">
            🔗 Connection Mode - Click on another service to connect (ESC to cancel)
          </div>
        )}

      <svg className="connections-svg">
        {connectionMode && connectingFrom && (
          <line
            x1={getItemCenter(connectingFrom).x}
            y1={getItemCenter(connectingFrom).y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#0078D4"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.6"
          />
        )}

        {connections.map((conn, index) => {
          const from = getItemCenter(conn.from);
          const to = getItemCenter(conn.to);
          const status = conn.status || 'valid';
          const message = getConnectionMessage(status);
          
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          
          const strokeColor = message.color;
          const markerId = `arrowhead-${status}`;
          
          return (
            <g key={index}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={strokeColor}
                strokeWidth="2"
                markerEnd={`url(#${markerId})`}
                className={`connection-line connection-${status}`}
              />
              <circle
                cx={midX}
                cy={midY}
                r="6"
                fill={strokeColor}
                stroke="white"
                strokeWidth="2"
                className={`connection-led led-${status}`}
              >
                <title>{message.text}</title>
              </circle>
              <circle
                cx={midX}
                cy={midY}
                r="6"
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                opacity="0.6"
                className={`led-pulse led-pulse-${status}`}
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead-valid"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#28a745" />
          </marker>
          <marker
            id="arrowhead-warning"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ffc107" />
          </marker>
          <marker
            id="arrowhead-invalid"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#dc3545" />
          </marker>
        </defs>
      </svg>      {items.map((item) => {
        const itemOnMouseDown = (e) => {
          if (e.button === 2 || e.ctrlKey) {
            startConnection(e, item);
          } else {
            startDragging(e, item);
          }
        };

        const itemOnMouseUp = (e) => completeConnection(e, item);

        return (
          <div
            key={item.id}
            className={`canvas-item ${selectedItem === item.id ? 'selected' : ''} ${connectingFrom === item.id ? 'connecting' : ''}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            onMouseDown={itemOnMouseDown}
            onMouseUp={itemOnMouseUp}
          >            <div className="item-symbol">
              <img 
                src={encodeURI(item.path)} 
                alt={item.name} 
                className="item-image"
                onError={(e) => {
                  console.error('Failed to load icon on canvas:', item.path);
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span className="item-label">{item.name}</span>
            {selectedItem === item.id && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteItem(item.id)}
              >
                ×
              </button>
            )}
          </div>
        );
      })}      {items.length === 0 && (
        <div className="canvas-placeholder">
          <p>🎨 Drag and drop Azure services here</p>
          <p className="canvas-hint">🔗 <strong>Right-click</strong> or <strong>Ctrl+Click</strong> on an item to start connection</p>
          <p className="canvas-hint">✏️ Press DELETE to remove selected items</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Canvas;
