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
  const [editingItem, setEditingItem] = useState(null);
  const [editingName, setEditingName] = useState('');
  const localCanvasRef = useRef(null);
  const inputRef = useRef(null);
    const activeCanvasRef = canvasRef || localCanvasRef;
  
  // Touch event handlers for icon drop from toolbar
  useEffect(() => {
    const handleIconTouchDrop = (e) => {
      console.log('Canvas received touch drop event:', e.detail);
      const { icon, clientX, clientY } = e.detail;
      const rect = activeCanvasRef.current?.getBoundingClientRect();
      
      console.log('Canvas rect:', rect);
      
      if (rect) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        console.log('Drop position relative to canvas:', x, y);
        
        // Check if drop is within canvas bounds
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
          console.log('Drop is within canvas bounds, creating item');
          const newItem = {
            id: Date.now(),
            serviceType: icon.id,
            name: icon.name,
            path: icon.path,
            category: icon.category,
            x: x - 40,
            y: y - 40,
          };
          
          setItems(prevItems => {
            console.log('Adding new item:', newItem);
            return [...prevItems, newItem];
          });
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(30);
          }
        } else {
          console.log('Drop is outside canvas bounds');
        }
      }
    };
    
    // Mobile click handler - add icon to center of canvas
    const handleIconMobileClick = (e) => {
      console.log('Canvas received mobile click event:', e.detail);
      const { icon } = e.detail;
      const rect = activeCanvasRef.current?.getBoundingClientRect();
      
      if (rect) {
        // Place icon in center of visible canvas
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const newItem = {
          id: Date.now(),
          serviceType: icon.id,
          name: icon.name,
          path: icon.path,
          category: icon.category,
          x: centerX - 40,
          y: centerY - 40,
        };
        
        setItems(prevItems => [...prevItems, newItem]);
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        
        console.log('Added icon to canvas center:', newItem);
      }
    };
    
    console.log('Setting up touch drop listener');
    document.addEventListener('iconTouchDrop', handleIconTouchDrop);
    document.addEventListener('iconMobileClick', handleIconMobileClick);
    
    return () => {
      console.log('Removing touch drop listener');
      document.removeEventListener('iconTouchDrop', handleIconTouchDrop);
      document.removeEventListener('iconMobileClick', handleIconMobileClick);
    };
  }, [setItems, activeCanvasRef]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const iconData = e.dataTransfer.getData('azureIcon');
    
    if (iconData) {
      const icon = JSON.parse(iconData);
      const rect = activeCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newItem = {
        id: Date.now(), // Unique instance ID
        serviceType: icon.id, // Service type like 'vm', 'storage'
        name: icon.name,
        path: icon.path,
        category: icon.category,
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
  };  const completeConnection = (e, item) => {
    if (connectionMode && connectingFrom && connectingFrom !== item.id) {
      const fromItem = items.find(i => i.id === connectingFrom);
      const toItem = item;
      
      // Validate connection using service types
      const validationStatus = validateConnection(fromItem.serviceType, toItem.serviceType);
      
      setConnections([...connections, { 
        from: connectingFrom, 
        to: item.id,
        status: validationStatus,
        fromType: fromItem.serviceType,
        toType: toItem.serviceType
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
    setDragOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y,
    });
  };

  const handleMouseMove = (e) => {
    const rect = activeCanvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    if (isDragging && selectedItem) {
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

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

  const handleStartEdit = (e, item) => {
    e.stopPropagation();
    setEditingItem(item.id);
    setEditingName(item.name);
  };

  const handleSaveName = (itemId) => {
    if (editingName.trim()) {
      setItems(items.map(item =>
        item.id === itemId ? { ...item, name: editingName.trim() } : item
      ));
    }
    setEditingItem(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingName('');
  };

  const handleNameKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName(itemId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingItem && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingItem]);

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
    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (currentRef) {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [selectedItem, setItems, setConnections, connectionMode, activeCanvasRef]);

  const getItemCenter = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return { x: 0, y: 0 };
    return { x: item.x + 40, y: item.y + 40 };
  };

  return (
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
        )}        {connections.map((conn, index) => {
          const from = getItemCenter(conn.from);
          const to = getItemCenter(conn.to);
          const status = conn.status || 'valid';
          const message = getConnectionMessage(status, conn.fromType, conn.toType);
          
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
                <title>{message.text}&#10;{message.hint}</title>
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
      </svg>      {items.map((item) => {
        const itemOnMouseDown = (e) => {
          // Start connection with: Right-click, Ctrl+Click, or Shift+Click
          if (e.button === 2 || e.ctrlKey || e.shiftKey) {
            startConnection(e, item);
          } else {
            startDragging(e, item);
          }
        };

        const itemOnMouseUp = (e) => completeConnection(e, item);

        // Touch event handlers for mobile
        const itemOnTouchStart = (e) => {
          e.stopPropagation();
          const touch = e.touches[0];
          setSelectedItem(item.id);
          setIsDragging(true);
          const rect = activeCanvasRef.current.getBoundingClientRect();
          setDragOffset({
            x: touch.clientX - rect.left - item.x,
            y: touch.clientY - rect.top - item.y,
          });
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(30);
          }
        };

        const itemOnTouchMove = (e) => {
          if (isDragging && selectedItem === item.id) {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            const rect = activeCanvasRef.current.getBoundingClientRect();
            const x = touch.clientX - rect.left - dragOffset.x;
            const y = touch.clientY - rect.top - dragOffset.y;

            setItems(items.map(itm =>
              itm.id === item.id ? { ...itm, x, y } : itm
            ));
          }
        };

        const itemOnTouchEnd = (e) => {
          e.stopPropagation();
          setIsDragging(false);
        };

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
            onTouchStart={itemOnTouchStart}
            onTouchMove={itemOnTouchMove}
            onTouchEnd={itemOnTouchEnd}
          >
            <div className="item-symbol">
              <img src={item.path} alt={item.name} className="item-image" />
            </div>
            
            {editingItem === item.id ? (
              <input
                ref={inputRef}
                type="text"
                className="item-label-edit"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleSaveName(item.id)}
                onKeyDown={(e) => handleNameKeyDown(e, item.id)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                className="item-label" 
                onDoubleClick={(e) => handleStartEdit(e, item)}
                title="Double-click to edit name"
              >
                {item.name}
              </span>
            )}
            
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
          <p className="canvas-hint">✏️ <strong>Double-click</strong> on a service name to edit it</p>
          <p className="canvas-hint">🔗 <strong>Right-click</strong>, <strong>Ctrl+Click</strong>, or <strong>Shift+Click</strong> on an item to start connection</p>
          <p className="canvas-hint">🗑️ Press <strong>DELETE</strong> to remove selected items</p>
          <p className="canvas-hint">🟢 Green LED = Valid | 🟡 Yellow = Warning | 🔴 Red = Invalid</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
