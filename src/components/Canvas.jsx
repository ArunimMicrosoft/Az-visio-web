import React, { useState, useRef, useEffect } from 'react';
import { validateConnection, getConnectionMessage } from '../utils/connectionValidator';
import BoundaryCanvas from './BoundaryCanvas';
import './Canvas.css';

const Canvas = ({ items, setItems, connections, setConnections, boundaries, setBoundaries, canvasRef, isTrial }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [boundaryDrawMode, setBoundaryDrawMode] = useState(false);
  const [boundaryType, setBoundaryType] = useState('resource-group');
  const [drawingBoundary, setDrawingBoundary] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const localCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Use passed ref or local ref
  const activeCanvasRef = canvasRef || localCanvasRef;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
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
        ...icon,
        // Preserve icon's original id as serviceType for connection validation
        serviceType: icon.id,
        // Generate unique numeric id for canvas item tracking
        id: Date.now(),
        x: x - 40,
        y: y - 40,
      };

      setItems([...items, newItem]);
    }
  };

  /**
   * Get the connection validation status between the connecting-from item
   * and a potential target item. Used for visual highlighting.
   */
  const getTargetValidationStatus = (targetItem) => {
    if (!connectionMode || !connectingFrom) return null;
    const fromItem = items.find(i => i.id === connectingFrom);
    if (!fromItem || fromItem.id === targetItem.id) return null;
    
    const fromType = (fromItem.serviceType || fromItem.id || '').toString().toLowerCase();
    const toType = (targetItem.serviceType || targetItem.id || '').toString().toLowerCase();
    return validateConnection(fromType, toType);
  };

  /**
   * Calculate the estimated monthly cost impact of a connection
   * Based on Azure networking/integration costs (data transfer, private endpoints, etc.)
   */
  const calculateConnectionCost = (fromItem, toItem) => {
    const fromType = (fromItem.serviceType || '').toLowerCase();
    const toType = (toItem.serviceType || '').toLowerCase();
    
    // Connection cost rules based on Azure pricing (USD/month estimates)
    const connectionCosts = {
      // VNet Peering
      'vnet-vnet': { cost: 10.00, label: 'VNet Peering (~$0.01/GB)', unit: '/month (est. 1TB)' },
      'virtualnetworks-virtualnetworks': { cost: 10.00, label: 'VNet Peering', unit: '/month' },
      // Private Endpoints
      'privatelink': { cost: 7.30, label: 'Private Endpoint', unit: '/month' },
      // VPN Gateway connections
      'vpngateway-vnet': { cost: 127.75, label: 'VPN Gateway', unit: '/month' },
      'vpngateway-virtualnetworks': { cost: 127.75, label: 'VPN Gateway', unit: '/month' },
      // ExpressRoute
      'expressroute-vnet': { cost: 51.00, label: 'ExpressRoute Circuit', unit: '/month' },
      'expressroute-virtualnetworks': { cost: 51.00, label: 'ExpressRoute', unit: '/month' },
      // Load Balancer data processing
      'loadbalancer-vm': { cost: 7.30, label: 'LB Data Processing', unit: '/month (est.)' },
      'loadbalancers-virtualmachine': { cost: 7.30, label: 'LB Processing', unit: '/month' },
      // App Gateway → backend
      'appgw-appservice': { cost: 18.00, label: 'App GW + WAF data', unit: '/month (est.)' },
      'appgw-vm': { cost: 18.00, label: 'App GW data processing', unit: '/month (est.)' },
      'applicationgateway-appservices': { cost: 18.00, label: 'App GW data', unit: '/month' },
      // Front Door
      'frontdoor-appservice': { cost: 35.00, label: 'Front Door routing', unit: '/month' },
      'frontdoor-appservices': { cost: 35.00, label: 'Front Door routing', unit: '/month' },
      // Service Bus / Event Hub integration
      'servicebus-function': { cost: 9.81, label: 'Service Bus messaging', unit: '/month (est.)' },
      'servicebus-functionapps': { cost: 9.81, label: 'Service Bus', unit: '/month' },
      'eventhubs-function': { cost: 11.23, label: 'Event Hub ingestion', unit: '/month' },
      'eventhubs-functionapps': { cost: 11.23, label: 'Event Hub', unit: '/month' },
      // Database connections (Private Link typically)
      'appservice-sqldb': { cost: 7.30, label: 'Private Endpoint to SQL', unit: '/month' },
      'appservices-sqldatabase': { cost: 7.30, label: 'Private Endpoint', unit: '/month' },
      'function-sqldb': { cost: 7.30, label: 'Private Endpoint to SQL', unit: '/month' },
      'functionapps-sqldatabase': { cost: 7.30, label: 'Private Endpoint', unit: '/month' },
      'appservice-cosmosdb': { cost: 7.30, label: 'Private Endpoint to Cosmos', unit: '/month' },
      'appservices-azurecosmosdb': { cost: 7.30, label: 'Private Endpoint', unit: '/month' },
      'aks-sqldb': { cost: 7.30, label: 'Private Endpoint to SQL', unit: '/month' },
      'kubernetesservices-sqldatabase': { cost: 7.30, label: 'Private Endpoint', unit: '/month' },
      // Storage connections
      'vm-storage': { cost: 0.00, label: 'No extra cost (same region)', unit: '' },
      'virtualmachine-storageaccounts': { cost: 0.00, label: 'Free (same region)', unit: '' },
      'function-storage': { cost: 0.00, label: 'Included with Function App', unit: '' },
      'functionapps-storageaccounts': { cost: 0.00, label: 'Included', unit: '' },
      // Monitoring
      'monitor-vm': { cost: 2.76, label: 'Log ingestion (~5GB)', unit: '/month' },
      'monitor-appservice': { cost: 2.76, label: 'Log ingestion (~5GB)', unit: '/month' },
      'appinsights-appservice': { cost: 2.88, label: 'App Insights data', unit: '/month' },
      'appinsights-function': { cost: 2.88, label: 'App Insights data', unit: '/month' },
      'applicationinsights-appservices': { cost: 2.88, label: 'App Insights', unit: '/month' },
      'applicationinsights-functionapps': { cost: 2.88, label: 'App Insights', unit: '/month' },
    };

    // Try both directions
    const key1 = `${fromType}-${toType}`;
    const key2 = `${toType}-${fromType}`;
    
    if (connectionCosts[key1]) return connectionCosts[key1];
    if (connectionCosts[key2]) return connectionCosts[key2];
    
    // Default: estimate based on whether a Private Endpoint is typically used
    const privateEndpointServices = ['sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 
      'storage', 'storageaccounts', 'keyvault', 'redis', 'mysql', 'mysqlserver', 
      'postgres', 'postgresqlserver', 'datalake', 'datalakestorage'];
    
    if (privateEndpointServices.includes(fromType) || privateEndpointServices.includes(toType)) {
      return { cost: 7.30, label: 'Private Endpoint (recommended)', unit: '/month' };
    }
    
    // Free intra-VNet or NSG/subnet connections
    const freeServices = ['vnet', 'virtualnetworks', 'subnet', 'subnets', 'nsg', 
      'networksecuritygroups', 'keyvault'];
    if (freeServices.includes(fromType) || freeServices.includes(toType)) {
      return { cost: 0.00, label: 'No additional cost', unit: '' };
    }
    
    // Generic data transfer estimate
    return { cost: 0.87, label: 'Data transfer (est. 100GB)', unit: '/month' };
  };

  const startConnection = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectionMode(true);
    setConnectingFrom(item.id);
  };

  const completeConnection = (e, item) => {
    if (connectionMode && connectingFrom && connectingFrom !== item.id) {
      e.stopPropagation(); // Prevent handleCanvasClick from cancelling the connection
      const fromItem = items.find(i => i.id === connectingFrom);
      if (!fromItem) return;
      
      // Use serviceType for validation (the original icon id, e.g. 'virtualmachines', 'storageaccounts')
      const fromType = (fromItem.serviceType || '').toString().toLowerCase();
      const toType = (item.serviceType || '').toString().toLowerCase();
      
      const validationStatus = validateConnection(fromType, toType);
      const message = getConnectionMessage(validationStatus, fromItem.name, item.name);
      
      // Calculate connection cost
      const costInfo = calculateConnectionCost(fromItem, item);
      
      setConnections([...connections, { 
        from: connectingFrom, 
        to: item.id,
        status: validationStatus,
        fromType: fromType,
        toType: toType,
        fromName: fromItem.name,
        toName: item.name,
        cost: costInfo
      }]);
      
      setConnectionMode(false);
      setConnectingFrom(null);
      
      // Show connection result with cost
      const costText = costInfo.cost > 0 
        ? `\n💰 Est. Cost: $${costInfo.cost.toFixed(2)}${costInfo.unit} (${costInfo.label})`
        : `\n💰 ${costInfo.label}`;
      console.log(`${message.text}${costText}`);
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

  const handleMouseUp = (e) => {
    if (connectionMode && connectingFrom) {
      const targetItem = items.find(item => item.id === connectingFrom);
      if (targetItem) {
        completeConnection(e, targetItem);
      }
    } else {
      setIsDragging(false);
    }
  };

  const handleCanvasClick = (e) => {
    // Only cancel connection mode if the click was directly on the canvas background,
    // NOT on a canvas item (items stop propagation in their own handlers)
    if (connectionMode) {
      // Check if click target is the canvas itself (not an item or child)
      const isCanvasBackground = e.target === activeCanvasRef.current || 
        e.target.classList.contains('canvas') ||
        e.target.classList.contains('boundary-layer') ||
        e.target.closest('.connections-svg');
      if (isCanvasBackground) {
        setConnectionMode(false);
        setConnectingFrom(null);
      }
    }
  };

  const handleDeleteItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    setConnections(connections.filter(conn => conn.from !== itemId && conn.to !== itemId));
    setSelectedItem(null);
  };

  // Start editing item name
  const startEditingItemName = (itemId, currentName) => {
    setEditingItemId(itemId);
    setEditingName(currentName);
    // Focus the input after render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Save edited item name
  const saveItemName = () => {
    if (editingItemId && editingName.trim()) {
      setItems(items.map(item =>
        item.id === editingItemId ? { ...item, name: editingName.trim() } : item
      ));
      // Update connection labels
      setConnections(connections.map(conn => {
        if (conn.from === editingItemId) {
          return { ...conn, fromName: editingName.trim() };
        }
        if (conn.to === editingItemId) {
          return { ...conn, toName: editingName.trim() };
        }
        return conn;
      }));
    }
    setEditingItemId(null);
    setEditingName('');
  };

  // Cancel editing
  const cancelEditingName = () => {
    setEditingItemId(null);
    setEditingName('');
  };

  // Handle keyboard events for name editing
  const handleNameInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveItemName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingName();
    }
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedItem && !editingItemId) {
        setItems(prevItems => prevItems.filter(item => item.id !== selectedItem));
        setConnections(prevConns => prevConns.filter(conn => conn.from !== selectedItem && conn.to !== selectedItem));
        setSelectedItem(null);
      }
      if (e.key === 'Escape' && connectionMode) {
        setConnectionMode(false);
        setConnectingFrom(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem, setItems, setConnections, connectionMode, activeCanvasRef, editingItemId]);

  const getItemCenter = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return { x: 0, y: 0 };
    return { x: item.x + 40, y: item.y + 40 };
  };  return (
    <div className="canvas-wrapper">
      {/* Professional Toolbar - Matches ControlPanel Design */}
      <div className={`canvas-toolbar ${boundaryDrawMode ? 'drawing-mode' : ''}`}>
        {/* Section 1: Drawing Tools */}
        <div className="toolbar-section">
          <span className="toolbar-label">Tools</span>
          <button
            className={`control-btn ${boundaryDrawMode ? 'active' : ''}`}
            onClick={() => {
              const newMode = !boundaryDrawMode;
              setBoundaryDrawMode(newMode);
              setConnectionMode(false);
            }}
            title="Draw Boundary (B)"
          >
            <span className="icon">📐</span>
            <span>Boundary</span>
          </button>
        </div>

        {/* Section 2: Boundary Type Selector (only when drawing) */}
        {boundaryDrawMode && (
          <div className="toolbar-section">
            <span className="toolbar-label">Type</span>
            <select 
              value={boundaryType} 
              onChange={(e) => setBoundaryType(e.target.value)}
              className="boundary-type-selector-toolbar"
              title="Select Boundary Type"
            >
              <option value="resource-group">📦 Resource Group</option>
              <option value="subscription">🎫 Subscription</option>
              <option value="virtual-network">🔷 Virtual Network</option>
              <option value="subnet">🔸 Subnet</option>
              <option value="region">🌍 Region</option>
              <option value="availability-zone">🏢 Availability Zone</option>
              <option value="security-boundary">🔒 Security Boundary</option>
              <option value="application">📱 Application</option>
              <option value="management-group">🏛️ Management Group</option>
              <option value="policy-scope">📋 Policy Scope</option>
              <option value="network-security-group">🛡️ Network Security Group</option>
            </select>
          </div>
        )}

        {/* Section 3: Instructions */}
        {boundaryDrawMode && (
          <div className="toolbar-section">
            <span className="toolbar-label" style={{ fontSize: '12px', color: '#0078D4', fontWeight: '600' }}>
              💡 Click and drag to draw boundary
            </span>
          </div>
        )}
      </div>

      <div ref={containerRef} className="canvas-container">        <div
          ref={activeCanvasRef}
          className={`canvas${isTrial ? ' canvas-trial' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        >{/* Boundary Layer - INSIDE canvas so it shares coordinate system */}
          <BoundaryCanvas
            boundaries={boundaries}
            setBoundaries={setBoundaries}
            items={items}
            boundaryDrawMode={boundaryDrawMode}
            drawingBoundary={drawingBoundary}
            setDrawingBoundary={setDrawingBoundary}
            boundaryType={boundaryType}
          />          {connectionMode && (
            <div className="connecting-status">
              🔗 Connection Mode — <strong>Double-click</strong> on a target service to connect
              {' '}| <span className="valid-hint">🟢 Valid</span>{' '}
              <span className="warning-hint">🟡 Uncommon</span>{' '}
              <span className="invalid-hint">🔴 Invalid</span>{' '}
              | Press <strong>ESC</strong> to cancel
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
            const message = getConnectionMessage(status, conn.fromName, conn.toName);
            
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            const strokeColor = message.color;
            const markerId = `arrowhead-${status}`;
            
            // Build tooltip with cost info
            const costText = conn.cost 
              ? (conn.cost.cost > 0 
                ? `\n💰 $${conn.cost.cost.toFixed(2)}${conn.cost.unit} — ${conn.cost.label}`
                : `\n💰 ${conn.cost.label}`)
              : '';
            const tooltip = `${message.text}${costText}`;
            
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
                {/* Connection cost label (shown near midpoint) */}
                {conn.cost && conn.cost.cost > 0 && (
                  <text
                    x={midX}
                    y={midY - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={strokeColor}
                    className="connection-cost-label"
                  >
                    ${conn.cost.cost.toFixed(2)}/mo
                  </text>
                )}
                <circle
                  cx={midX}
                  cy={midY}
                  r="6"
                  fill={strokeColor}
                  stroke="white"
                  strokeWidth="2"
                  className={`connection-led led-${status}`}
                >
                  <title>{tooltip}</title>
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
            <marker id="arrowhead-valid" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#28a745" />
            </marker>
            <marker id="arrowhead-warning" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#ffc107" />
            </marker>
            <marker id="arrowhead-invalid" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#dc3545" />
            </marker>
          </defs>
        </svg>

        {items.map((item) => {
          // Determine visual connection validation status for this target
          const targetStatus = getTargetValidationStatus(item);
          const isSource = connectingFrom === item.id;
          const itemOnMouseDown = (e) => {
            if (connectionMode && connectingFrom) {
              // In connection mode — do nothing on single click (use double-click)
              e.stopPropagation();
              return;
            } else if (e.ctrlKey || e.shiftKey) {
              // Ctrl+Click or Shift+Click — start a new connection
              startConnection(e, item);
            } else if (e.button === 0) {
              // Normal left-click — drag the item
              startDragging(e, item);
            }
          };

          const itemOnContextMenu = (e) => {
            e.preventDefault(); // Prevent browser context menu
            e.stopPropagation(); // Prevent bubbling
            startConnection(e, item);
          };          const itemOnDoubleClick = (e) => {
            if (connectionMode && connectingFrom && connectingFrom !== item.id) {
              e.stopPropagation();
              completeConnection(e, item);
            } else if (!connectionMode) {
              // Double-click to edit name when NOT in connection mode
              e.stopPropagation();
              startEditingItemName(item.id, item.name);
            }
          };          const itemOnMouseUp = (e) => {
            if (connectionMode && connectingFrom && connectingFrom !== item.id) {
              e.stopPropagation();
              completeConnection(e, item);
            }
          };

          // Complete connection on click as well (for left-click after right-click)
          const itemOnClick = (e) => {
            if (connectionMode && connectingFrom && connectingFrom !== item.id) {
              e.stopPropagation();
              e.preventDefault();
              completeConnection(e, item);
            } else if (connectionMode) {
              e.stopPropagation();
            }
          };

          // Build CSS class for connection-mode visual feedback
          let connectionClass = '';
          if (isSource) {
            connectionClass = 'connecting';
          } else if (targetStatus === 'valid') {
            connectionClass = 'connection-target-valid';
          } else if (targetStatus === 'warning') {
            connectionClass = 'connection-target-warning';
          } else if (targetStatus === 'invalid') {
            connectionClass = 'connection-target-invalid';
          } else if (connectionMode && !isSource) {
            connectionClass = 'connection-target-warning'; // Unknown defaults to warning
          }

          return (
            <div
              key={item.id}
              className={`canvas-item ${selectedItem === item.id ? 'selected' : ''} ${connectionClass}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                cursor: connectionMode && !isSource ? 'crosshair' : 'grab',
              }}
              onMouseDown={itemOnMouseDown}
              onContextMenu={itemOnContextMenu}
              onDoubleClick={itemOnDoubleClick}
              onMouseUp={itemOnMouseUp}
              onClick={itemOnClick}
            >
              <div className="item-symbol">
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
              {editingItemId === item.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleNameInputKeyDown}
                  onBlur={saveItemName}
                  className="item-name-input"
                />
              ) : (
                <span className="item-label" onDoubleClick={() => startEditingItemName(item.id, item.name)}>
                  {item.name}
                </span>
              )}
              {/* Show validation badge on targets during connection mode */}
              {connectionMode && !isSource && targetStatus && (
                <span className={`connection-badge badge-${targetStatus}`}>
                  {targetStatus === 'valid' ? '✓' : targetStatus === 'warning' ? '⚠' : '✗'}
                </span>
              )}
              {selectedItem === item.id && !connectionMode && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}        {items.length === 0 && (
          <div className="canvas-placeholder">
            <p>🎨 Drag and drop Azure services here</p>
            <p className="canvas-hint">🔗 <strong>Right-click</strong> on a service to start a connection</p>
            <p className="canvas-hint">🔗 <strong>Double-click</strong> the target service to complete the connection</p>
            <p className="canvas-hint">✏️ Press <strong>DELETE</strong> to remove selected items</p>
          </div>
        )}        {/* Trial watermark — CSS class on .canvas drives a ::after pseudo-element
            with a repeating SVG background tile. Covers every pixel of the
            5000×5000 canvas with zero DOM nodes and zero overflow.
            Only shown for trial users — never for admin/paid/enterprise. */}
        {/* (watermark is pure CSS — see .canvas.trial-watermark-active::after) */}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
