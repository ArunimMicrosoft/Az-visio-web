import React, { useState } from 'react';
import './HelpOverlay.css';

const HelpOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button className="help-button" onClick={() => setIsVisible(true)}>
        ❓ Help
      </button>
    );
  }

  return (
    <div className="help-overlay">
      <div className="help-content">
        <button className="close-help" onClick={() => setIsVisible(false)}>×</button>
        <h3>🎯 How to Use Azure Architecture Designer</h3>
        
        <div className="help-section">
          <h4>📦 Adding Services</h4>
          <ol>
            <li>Select a category from the left sidebar tabs</li>
            <li>Drag an Azure icon from the toolbar</li>
            <li>Drop it onto the canvas</li>
          </ol>
        </div>        <div className="help-section">
          <h4>🔗 Connecting Services with Validation</h4>
          <ol>
            <li><strong>Right-click</strong>, <strong>Ctrl+Click</strong>, or <strong>Shift+Click</strong> on the first service</li>
            <li>The service will turn <strong>green</strong> (connection mode activated)</li>
            <li>Click on the second service to complete the connection</li>
            <li>A connection line appears with a color-coded LED indicator</li>
            <li>Hover over the LED to see validation details and recommendations</li>
          </ol>
          <div className="help-tip">
            💡 <strong>Three ways to connect:</strong> Right-click, Ctrl+Click, or Shift+Click!
          </div>
          <div className="help-tip" style={{borderColor: '#28a745', backgroundColor: '#d4edda', color: '#155724', marginTop: '8px'}}>
            🟢 <strong>Green LED</strong> = Valid Azure architecture pattern<br/>
            🟡 <strong>Yellow LED</strong> = Uncommon - verify if necessary<br/>
            🔴 <strong>Red LED</strong> = Invalid - violates best practices
          </div>
          <div className="help-tip" style={{borderColor: '#0078D4', backgroundColor: '#e3f2fd', color: '#01579b', marginTop: '8px'}}>
            ℹ️ Connections are validated against Azure best practices. Hover over LED indicators for specific recommendations!
          </div>
        </div>

        <div className="help-section">
          <h4>✏️ Managing Items</h4>
          <ul>
            <li><strong>Move:</strong> Click and drag items</li>
            <li><strong>Select:</strong> Click on an item (blue border)</li>
            <li><strong>Delete:</strong> Press DELETE key or click × button</li>
          </ul>
        </div>        <div className="help-section">
          <h4>💾 Saving Your Work</h4>
          <ul>
            <li><strong>💾 Save:</strong> Saves to browser storage</li>
            <li><strong>📂 Load:</strong> Restores saved diagram</li>
            <li><strong>📤 JSON:</strong> Downloads as JSON file</li>
            <li><strong>🖼️ PNG:</strong> Exports as high-res image</li>
            <li><strong>📄 PDF:</strong> Exports as PDF document</li>
            <li><strong>🗑️ Clear:</strong> Removes all items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpOverlay;
