import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../utils/adminCheck';
import TerraformPastePanel from './TerraformPastePanel';
import './ControlPanel.css';

const ControlPanel = ({ 
  onSave, 
  onLoad, 
  onClear,
  onValidate,
  onExport, 
  onExportPNG, 
  onExportPDF,
  onExportTerraform,
  onExportARM,
  onExportBicep,
  onExportCostReport,
  onImportTerraform,
  onPasteTerraform,
  onOpenTemplates,
  onOpenVersions,
  onOpenPresentation,
  onOpenRegionCompare,
  onOpenMyDiagrams,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isTrial,
  onUpgrade,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  const userIsAdmin = isAdmin(user);

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h2 className="app-title">Azure Architecture Designer</h2>
        
        <div className="user-menu-container">
          <button 
            className="user-menu-btn" 
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={`Logged in as ${user?.email || 'User'}`}
          >
            <span className="user-icon">👤</span>
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="dropdown-icon">▼</span>
          </button>
          
          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                  <div className="user-display-name">{user?.name || 'User'}</div>
                  <div className="user-email">{user?.email || ''}</div>
                </div>              </div>
              <div className="user-menu-divider"></div>
              {userIsAdmin && (
                <>
                  <button className="user-menu-item admin-item" onClick={handleAdminDashboard}>
                    <span className="menu-icon">🔐</span>
                    Admin Dashboard
                  </button>
                  <div className="user-menu-divider"></div>
                </>
              )}
              <button className="user-menu-item" onClick={handleLogout}>
                <span className="menu-icon">🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="control-buttons">
        {/* Undo / Redo */}
        <button className="control-btn undo-btn" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          ↩️ Undo
        </button>
        <button className="control-btn redo-btn" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          ↪️ Redo
        </button>

        <span className="control-divider" />

        <button className="control-btn template-btn" onClick={onOpenTemplates} title="Load a pre-built architecture template">
          📐 Templates
        </button>
        <button className="control-btn save-btn" onClick={onSave} title="Save diagram to local file">
          💾 Save
        </button>        <button className="control-btn load-btn" onClick={onLoad} title="Load diagram from file">
          📂 Load
        </button>
        <button className="control-btn cloud-btn" onClick={onOpenMyDiagrams} title="Save/load diagrams from cloud">
          ☁️ My Diagrams
        </button>
        <button className="control-btn version-btn" onClick={onOpenVersions} title="Version history snapshots">
          📋 Versions
        </button>

        <span className="control-divider" />

        <button className="control-btn terraform-import-btn" onClick={onImportTerraform} title="Import Terraform file (.tf or .tf.json)">
          🏗️ Import TF
        </button>
        <TerraformPastePanel
          onImport={onPasteTerraform}
          isTrial={isTrial}
          onUpgrade={onUpgrade}
        />
        <button className="control-btn validate-btn" onClick={onValidate} title="Validate architecture for deployment">
          ✅ Validate
        </button>

        <span className="control-divider" />

        <button className="control-btn export-btn" onClick={onExport} title="Export as JSON">
          📤 JSON
        </button>
        <button className="control-btn export-png-btn" onClick={onExportPNG} title="Export as PNG image">
          🖼️ PNG
        </button>
        <button className="control-btn export-pdf-btn" onClick={onExportPDF} title="Export as PDF document">
          📄 PDF
        </button>
        <button className="control-btn terraform-btn" onClick={onExportTerraform} title="Export Terraform configuration">
          🏗️ Terraform
        </button>
        <button className="control-btn bicep-btn" onClick={onExportBicep} title="Export Bicep template">
          🔷 Bicep
        </button>
        <button className="control-btn arm-btn" onClick={onExportARM} title="Export ARM Template">
          📋 ARM
        </button>
        <button className="control-btn cost-btn" onClick={onExportCostReport} title="Export cost estimate report">
          💰 Cost
        </button>

        <span className="control-divider" />

        <button className="control-btn compare-btn" onClick={onOpenRegionCompare} title="Compare costs across regions">
          🌍 Compare
        </button>
        <button className="control-btn present-btn" onClick={onOpenPresentation} title="Full-screen presentation mode">
          🖥️ Present
        </button>
        <button className="control-btn clear-btn" onClick={onClear} title="Clear canvas">
          🗑️ Clear
        </button>      
      </div>        <div className="help-text">
        <p>📋 Drag Azure services from the left panel to the canvas</p>
        <p>✏️ Double-click service names to edit them (e.g., VM1, VM2)</p>
        <p>🔗 Right-click a service to start connection → targets glow green/yellow/red</p>
        <p>🔗 Double-click a highlighted target to complete the connection (with live cost)</p>
        <p>🟢 Green = Valid | 🟡 Yellow = Warning | 🔴 Red = Invalid (Hover LED for details)</p>
      </div>
    </div>
  );
};

export default ControlPanel;
