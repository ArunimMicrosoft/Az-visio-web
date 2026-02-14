import React from 'react';
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
  onExportCostReport,
  onImportTerraform
}) => {
  return (
    <div className="control-panel">
      <h2 className="app-title">Azure Architecture Designer</h2>
      <div className="control-buttons">        
        <button className="control-btn save-btn" onClick={onSave} title="Save diagram to local file">
          💾 Save
        </button>
        <button className="control-btn load-btn" onClick={onLoad} title="Load diagram from file">
          📂 Load
        </button>
        <button className="control-btn validate-btn" onClick={onValidate} title="Validate architecture for deployment">
          ✅ Validate
        </button>
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
        <button className="control-btn import-tf-btn" onClick={onImportTerraform} title="Import Terraform .tf file to canvas">
          📥 Import TF
        </button>
        <button className="control-btn arm-btn" onClick={onExportARM} title="Export ARM Template">
          📋 ARM
        </button>
        <button className="control-btn cost-btn" onClick={onExportCostReport} title="Export cost estimate report">
          💰 Cost
        </button>
        <button className="control-btn clear-btn" onClick={onClear} title="Clear canvas">
          🗑️ Clear
        </button>      
      </div>      
      <div className="help-text">
        <p>📋 Drag Azure services from the left panel to the canvas</p>
        <p>✏️ Double-click service names to edit them (e.g., VM1, VM2)</p>
        <p>🔗 Right-click, Ctrl+Click, or Shift+Click to connect services</p>
        <p>🟢 Green = Valid | 🟡 Yellow = Warning | 🔴 Red = Invalid (Hover LED for details)</p>
      </div>
    </div>
  );
};

export default ControlPanel;
