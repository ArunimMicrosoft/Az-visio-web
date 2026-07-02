import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../utils/adminCheck';
import TerraformPastePanel from './TerraformPastePanel';
import './ControlPanel.css';

/**
 * Enterprise-style toolbar with categorised menus (File / Import / Export /
 * View / Help). Only frequent actions (Undo, Redo, Validate) stay inline.
 * Every menu button is a plain-text row inside a dropdown, matching the UX of
 * Figma, draw.io and Visio.
 */

// Small reusable dropdown menu wrapper
function Menu({ label, icon, children, primary = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className={`cp-menu ${open ? 'cp-menu--open' : ''}`} ref={ref}>
      <button
        className={`cp-menu-trigger ${primary ? 'cp-menu-trigger--primary' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {icon && <span className="cp-menu-icon">{icon}</span>}
        <span>{label}</span>
        <span className={`cp-menu-caret ${open ? 'cp-menu-caret--open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="cp-menu-dropdown" role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, hint, onClick, danger = false, disabled = false, badge }) {
  return (
    <button
      className={`cp-menu-item ${danger ? 'cp-menu-item--danger' : ''}`}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      <span className="cp-menu-item-icon">{icon}</span>
      <span className="cp-menu-item-body">
        <span className="cp-menu-item-label">{label}</span>
        {hint && <span className="cp-menu-item-hint">{hint}</span>}
      </span>
      {badge && <span className="cp-menu-item-badge">{badge}</span>}
    </button>
  );
}

function MenuDivider() { return <div className="cp-menu-divider" />; }
function MenuLabel({ text }) { return <div className="cp-menu-label">{text}</div>; }

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
  onOpenDiscovery,
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
  const [showHelp, setShowHelp] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const userIsAdmin = isAdmin(user);

  const confirmClear = () => {
    if (window.confirm('Clear the entire canvas? This cannot be undone.')) onClear();
  };

  return (
    <div className="control-panel control-panel--v2">
      {/* Top row: brand + user */}
      <div className="cp-topbar">
        <div className="cp-brand">
          <span className="cp-brand-icon">☁️</span>
          <span className="cp-brand-name">Cloud Canvas Designer</span>
        </div>

        <div className="cp-topbar-actions">
          <button
            className="cp-help-btn"
            onClick={() => setShowHelp(v => !v)}
            title="Show canvas tips"
          >
            <span>?</span> Tips
          </button>

          <div className="user-menu-container">
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={`Logged in as ${user?.email || 'User'}`}
            >
              <span className="user-icon">👤</span>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="dropdown-icon">▾</span>
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-avatar">👤</div>
                  <div className="user-info">
                    <div className="user-display-name">{user?.name || 'User'}</div>
                    <div className="user-email">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="user-menu-divider" />
                {userIsAdmin && (
                  <>
                    <button className="user-menu-item admin-item" onClick={() => navigate('/admin')}>
                      <span className="menu-icon">🔐</span>Admin Dashboard
                    </button>
                    <div className="user-menu-divider" />
                  </>
                )}
                <button className="user-menu-item" onClick={handleLogout}>
                  <span className="menu-icon">🚪</span>Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu row — categorised like a desktop app */}
      <div className="cp-menubar">
        {/* File */}
        <Menu label="File" icon="📁">
          <MenuLabel text="NEW" />
          <MenuItem icon="📐" label="Templates" hint="Start from a pre-built architecture" onClick={onOpenTemplates} />
          <MenuItem icon="🗑️" label="Clear canvas" hint="Delete everything and start over" onClick={confirmClear} danger />
          <MenuDivider />
          <MenuLabel text="SAVE & LOAD" />
          <MenuItem icon="💾" label="Save to file" hint="Download as .json" onClick={onSave} />
          <MenuItem icon="📂" label="Load from file" hint="Open a saved .json" onClick={onLoad} />
          <MenuDivider />
          <MenuLabel text="CLOUD" />
          <MenuItem icon="☁️" label="My diagrams" hint="Diagrams saved to your account" onClick={onOpenMyDiagrams} />
          <MenuItem icon="🕘" label="Version history" hint="Restore any earlier snapshot" onClick={onOpenVersions} />
        </Menu>

        {/* Import */}
        <Menu label="Import" icon="⤵️">
          <MenuLabel text="AZURE FILES" />
          <MenuItem
            icon="🧭"
            label="Architecture Discovery"
            hint="ARM · Bicep · Terraform · Resource Graph · Az CLI · PowerShell"
            onClick={onOpenDiscovery}
            badge={isTrial ? 'PRO' : null}
          />
          <MenuDivider />
          <MenuLabel text="TERRAFORM" />
          <MenuItem icon="🏗️" label="Import .tf / .tf.json" hint="Load a Terraform file from disk" onClick={onImportTerraform} />
          <div className="cp-menu-item cp-menu-item--custom" onClick={(e) => e.stopPropagation()}>
            {/* Existing paste panel — its own toggle */}
            <TerraformPastePanel
              onImport={onPasteTerraform}
              isTrial={isTrial}
              onUpgrade={onUpgrade}
            />
          </div>
        </Menu>

        {/* Export */}
        <Menu label="Export" icon="⤴️">
          <MenuLabel text="IMAGE" />
          <MenuItem icon="🖼️" label="PNG image" hint="Best for slides and docs" onClick={onExportPNG} />
          <MenuItem icon="📄" label="PDF document" hint="Multi-page architecture report" onClick={onExportPDF} />
          <MenuDivider />
          <MenuLabel text="INFRASTRUCTURE AS CODE" />
          <MenuItem icon="🏗️" label="Terraform (.tf)" hint="Deployable HCL for AzureRM" onClick={onExportTerraform} />
          <MenuItem icon="🔷" label="Bicep (.bicep)" hint="Native Azure IaC" onClick={onExportBicep} />
          <MenuItem icon="📋" label="ARM template" hint="JSON ARM deployment" onClick={onExportARM} />
          <MenuDivider />
          <MenuLabel text="DATA" />
          <MenuItem icon="📤" label="JSON diagram" hint="Native Cloud Canvas format" onClick={onExport} />
          <MenuItem icon="💰" label="Cost report" hint="Detailed pricing breakdown" onClick={onExportCostReport} />
        </Menu>

        {/* View */}
        <Menu label="View" icon="👁️">
          <MenuItem icon="🖥️" label="Presentation mode" hint="Full-screen review view" onClick={onOpenPresentation} />
          <MenuItem icon="🌍" label="Compare regions" hint="See cost impact across Azure regions" onClick={onOpenRegionCompare} />
        </Menu>

        <span className="cp-menubar-spacer" />

        {/* Inline: Undo / Redo / Validate (frequent actions) */}
        <button
          className="cp-icon-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >↶</button>
        <button
          className="cp-icon-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >↷</button>

        <button
          className="cp-primary-btn"
          onClick={onValidate}
          title="Validate architecture for deployment"
        >
          <span>✅</span> Validate
        </button>
      </div>

      {/* Collapsible help hints */}
      {showHelp && (
        <div className="help-text help-text--v2">
          <p>📋 Drag Azure services from the left panel to the canvas</p>
          <p>✏️ Double-click a service name to rename it</p>
          <p>🔗 Right-click a service to start a connection — valid targets glow green</p>
          <p>🔗 Double-click a highlighted target to complete the connection</p>
          <p>🟢 Green = Valid · 🟡 Yellow = Warning · 🔴 Red = Invalid (hover the LED for details)</p>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
