// TerraformPastePanel — inline collapsible card inside ControlPanel
// Visible to all users; trial users see upgrade prompt instead of diagram generation.
import { useState } from 'react';
import { parseTerraformFile, validateTerraformFile } from '../utils/terraformParser';
import './TerraformPastePanel.css';

const PLACEHOLDER = `# Paste your Terraform HCL here, e.g.:
resource "azurerm_resource_group" "rg" {
  name     = "my-rg"
  location = "East US"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "my-vnet"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                = "my-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_D2s_v3"
}`;

export default function TerraformPastePanel({ onImport, isTrial, onUpgrade }) {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);

  const handleRun = () => {
    if (isTrial) { onUpgrade?.(); return; }
    setStatus(null);
    const trimmed = code.trim();
    if (!trimmed) { setStatus({ type: 'error', msg: 'Paste some Terraform code first.' }); return; }
    const validation = validateTerraformFile(trimmed, 'pasted.tf');
    if (!validation.valid) { setStatus({ type: 'error', msg: validation.errors.join('\n') }); return; }
    try {
      const result = parseTerraformFile(trimmed, 'pasted.tf');
      if (!result.items || result.items.length === 0) {
        setStatus({ type: 'warn', msg: 'No recognised Azure resources found.' });
        return;
      }
      onImport(result);
      setStatus({ type: 'success', msg: `✅ ${result.items.length} resource${result.items.length !== 1 ? 's' : ''} added to canvas.` });
    } catch (e) { setStatus({ type: 'error', msg: e.message }); }
  };

  const handleToggle = () => { setExpanded(v => !v); if (expanded) setStatus(null); };

  return (
    <div className={`tf-paste-wrap ${expanded ? 'tf-paste-wrap--open' : ''}`}>
      {/* toggle button — rendered inline in the control-buttons row by ControlPanel */}
      <button
        className={`control-btn tf-toggle-btn ${expanded ? 'tf-toggle-btn--active' : ''}`}
        onClick={handleToggle}
        title="Paste Terraform HCL and auto-generate diagram"
      >
        ⚡ TF Paste {expanded ? '▲' : '▼'}
      </button>

      {/* dropdown card — absolutely positioned below the toolbar */}
      {expanded && (
        <div className="tf-paste-dropdown">
          <div className="tf-paste-dropdown-header">
            <span>⚡ Terraform → Diagram</span>
            <button className="tf-close-btn" onClick={handleToggle}>✕</button>
          </div>

          {isTrial ? (
            <div className="tf-trial-block">
              <span className="tf-trial-icon">🔒</span>
              <div className="tf-trial-text">
                <strong>Pro feature</strong>
                <span>Upgrade to paste Terraform HCL and instantly generate architecture diagrams.</span>
              </div>
              <button className="tf-btn tf-btn--upgrade" onClick={() => { onUpgrade?.(); handleToggle(); }}>
                Upgrade Plan →
              </button>
            </div>
          ) : (
            <>
              <textarea
                className="tf-paste-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={PLACEHOLDER}
                spellCheck={false}
                autoComplete="off"
              />
              <div className="tf-paste-footer">
                <div className="tf-paste-actions">
                  <button className="tf-btn tf-btn--run" onClick={handleRun}>▶ Generate Diagram</button>
                  <button className="tf-btn tf-btn--clear" onClick={() => { setCode(''); setStatus(null); }}>✕ Clear</button>
                </div>
                {status && (
                  <div className={`tf-paste-status tf-paste-status--${status.type}`}>{status.msg}</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
