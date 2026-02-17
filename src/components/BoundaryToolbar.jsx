import React from 'react';
import './BoundaryToolbar.css';

const boundaryTypes = [
  {
    id: 'resource-group',
    name: 'Resource Group',
    icon: '📦',
    color: '#0078D4',
    description: 'Logical container for Azure resources'
  },
  {
    id: 'subscription',
    name: 'Subscription',
    icon: '🎫',
    color: '#5C2D91',
    description: 'Billing and access management boundary'
  },
  {
    id: 'virtual-network',
    name: 'Virtual Network',
    icon: '🔷',
    color: '#008272',
    description: 'Network isolation boundary'
  },
  {
    id: 'subnet',
    name: 'Subnet',
    icon: '🔸',
    color: '#00BCF2',
    description: 'Network subnet within VNet'
  },
  {
    id: 'region',
    name: 'Region',
    icon: '🌍',
    color: '#FF6C37',
    description: 'Azure geographic region'
  },
  {
    id: 'availability-zone',
    name: 'Availability Zone',
    icon: '🏢',
    color: '#FFB900',
    description: 'Physical datacenter zone'
  },
  {
    id: 'security-boundary',
    name: 'Security Boundary',
    icon: '🔒',
    color: '#E81123',
    description: 'Security isolation zone'
  },
  {
    id: 'application',
    name: 'Application',
    icon: '📱',
    color: '#107C10',
    description: 'Application grouping'
  }
];

const BoundaryToolbar = ({ onBoundarySelect = () => {}, selectedBoundary = null }) => {
  return (
    <div className="boundary-toolbar">
      <div className="boundary-toolbar-header">
        <h3>📐 Boundaries & Groups</h3>
        <span className="boundary-help-icon" title="Drag boundaries onto canvas to organize your architecture">ℹ️</span>
      </div>
      
      <div className="boundary-list">
        {boundaryTypes.map(boundary => (
          <div
            key={boundary.id}
            className={`boundary-item ${selectedBoundary?.id === boundary.id ? 'selected' : ''}`}
            onClick={() => onBoundarySelect && onBoundarySelect(boundary)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('boundary', JSON.stringify(boundary));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            title={boundary.description}
            style={{ borderLeftColor: boundary.color }}
          >
            <span className="boundary-icon">{boundary.icon}</span>
            <div className="boundary-info">
              <div className="boundary-name">{boundary.name}</div>
              <div className="boundary-desc">{boundary.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="boundary-instructions">
        <p>💡 <strong>How to use:</strong></p>
        <ul>
          <li>Click or drag a boundary type onto the canvas</li>
          <li>Resize boundaries by dragging corners</li>
          <li>Move boundaries by dragging the header</li>
          <li>Services inside boundaries are automatically grouped</li>
        </ul>
      </div>
    </div>
  );
};

export default BoundaryToolbar;
