// TerraformPastePanel — paste raw Terraform HCL and generate diagram
// Self-contained, collapsible card. Uses existing parseTerraformFile utility.
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

export default function TerraformPastePanel({ onImport }) {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'warn', msg }

  const handleRun = () => {
    setStatus(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setStatus({ type: 'error', msg: 'Paste some Terraform code first.' });
      return;
    }

    const validation = validateTerraformFile(trimmed, 'pasted.tf');
    if (!validation.valid) {
      setStatus({ type: 'error', msg: validation.errors.join('\n') });
      return;
    }

    try {
      const result = parseTerraformFile(trimmed, 'pasted.tf');
      if (!result.items || result.items.length === 0) {
        setStatus({ type: 'warn', msg: 'No recognised Azure resources found in the code.' });
        return;
      }
      onImport(result);
      setStatus({ type: 'success', msg: `✅ ${result.items.length} resource${result.items.length !== 1 ? 's' : ''} added to canvas.` });
    } catch (e) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  const handleClear = () => {
    setCode('');
    setStatus(null);
  };

  return (
    <div className={`tf-paste-panel ${expanded ? 'tf-paste-panel--open' : ''}`}>
      {/* ── header / toggle ── */}
      <button
        className="tf-paste-toggle"
        onClick={() => setExpanded(v => !v)}
        title={expanded ? 'Collapse Terraform panel' : 'Paste & run Terraform HCL'}
      >
        <span className="tf-paste-toggle__icon">⚡</span>
        <span className="tf-paste-toggle__label">Terraform → Diagram</span>
        <span className="tf-paste-toggle__chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* ── body (only rendered when expanded) ── */}
      {expanded && (
        <div className="tf-paste-body">
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
              <button className="tf-btn tf-btn--run" onClick={handleRun}>
                ▶ Generate Diagram
              </button>
              <button className="tf-btn tf-btn--clear" onClick={handleClear}>
                ✕ Clear
              </button>
            </div>
            {status && (
              <div className={`tf-paste-status tf-paste-status--${status.type}`}>
                {status.msg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
