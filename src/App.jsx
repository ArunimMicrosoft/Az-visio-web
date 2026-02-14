import { useState, useRef } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/Canvas-new.jsx';
import ControlPanel from './components/ControlPanel';
import HelpOverlay from './components/HelpOverlay';
import Footer from './components/Footer';
import CostSummary from './components/CostSummary';
import ValidationPanel from './components/ValidationPanel';
import { 
  exportJSON, 
  exportPNG, 
  exportPDF, 
  exportTerraform, 
  exportARMTemplate,
  exportCostReport 
} from './utils/enterpriseExporter';
import { parseTerraform } from './utils/terraformParser';
import './App.css';

console.log('=== APP.JSX LOADING ===');
console.log('Imports loaded successfully');

function App() {
  console.log('=== APP FUNCTION EXECUTING ===');  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('eastus');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const canvasRef = useRef(null);

  const handleValidate = () => {
    if (items.length === 0) {
      alert('⚠️ Canvas is empty! Add Azure services to validate the architecture.');
      return;
    }
    setIsValidationOpen(true);
  };
  const handleSave = () => {
    if (items.length === 0) {
      alert('⚠️ Canvas is empty! Add some Azure services before saving.');
      return;
    }

    try {
      const diagram = {
        items,
        connections,
        metadata: {
          version: '1.0',
          savedAt: new Date().toISOString(),
          itemCount: items.length,
          connectionCount: connections.length,
          appName: 'Azure Architecture Designer'
        }
      };

      // Create a blob with the JSON data
      const jsonString = JSON.stringify(diagram, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `azure-diagram-${timestamp}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`✅ Diagram saved successfully!\n\n📁 File: ${link.download}\n📊 ${items.length} services, ${connections.length} connections`);
    } catch (error) {
      console.error('Error saving diagram:', error);
      alert(`❌ Failed to save diagram!\n\n${error.message}`);
    }
  };

  const handleLoad = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ File is too large! Maximum size is 10MB.');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const diagram = JSON.parse(content);
          
          // Validate the loaded data
          if (!diagram.items || !Array.isArray(diagram.items)) {
            throw new Error('Invalid diagram file: missing or invalid items array');
          }
          
          // Load the diagram
          setItems(diagram.items || []);
          setConnections(diagram.connections || []);
          
          const itemCount = diagram.items.length;
          const connCount = (diagram.connections || []).length;
          const savedDate = diagram.metadata?.savedAt 
            ? new Date(diagram.metadata.savedAt).toLocaleString()
            : 'Unknown';
          
          alert(`✅ Diagram loaded successfully!\n\n📁 File: ${file.name}\n📊 ${itemCount} services, ${connCount} connections\n📅 Saved: ${savedDate}`);
        } catch (error) {
          console.error('Error loading diagram:', error);
          alert(`❌ Failed to load diagram!\n\n${error.message}\n\nPlease ensure the file is a valid Azure Architecture Designer JSON file.`);
        }
      };
      
      reader.onerror = () => {
        alert('❌ Failed to read file! Please try again.');
      };
      
      reader.readAsText(file);
    };
    
    // Trigger file picker
    input.click();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      setItems([]);
      setConnections([]);
    }
  };
  const handleExport = async () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      const result = await exportJSON(items, connections, {
        environment: 'production',
        author: 'User',
        description: 'Azure Architecture Diagram'
      });
      alert(`✅ JSON exported successfully!\n\n📁 ${result.filename}\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert(`❌ Failed to export JSON!\n\n${error.message}`);
    }
  };

  const handleExportPNG = async () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }

      const result = await exportPNG(canvasElement, items, connections, {
        quality: 'high',
        environment: 'production'
      });
      
      alert(`✅ PNG exported successfully!\n\n📁 ${result.filename}\n📐 ${result.dimensions.width}x${result.dimensions.height}px\n📊 ${result.size} bytes`);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert(`❌ Failed to export PNG!\n\n${error.message}`);
    }
  };
  
  const handleExportPDF = async () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }

      const result = await exportPDF(canvasElement, items, connections, {
        title: 'Azure Architecture Diagram',
        author: 'Architecture Team',
        environment: 'production',
        region: selectedRegion
      });
      
      alert(`✅ PDF exported successfully!\n\n📁 ${result.filename}\n📄 ${result.pages} pages\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`❌ Failed to export PDF!\n\n${error.message}`);
    }
  };

  const handleExportTerraform = async () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      const result = await exportTerraform(items, connections, {
        environment: 'production',
        region: selectedRegion
      });
      
      alert(`✅ Terraform configuration exported successfully!\n\n📦 Files generated:\n${result.files.map(f => `  • ${f}`).join('\n')}\n\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting Terraform:', error);
      alert(`❌ Failed to export Terraform!\n\n${error.message}`);
    }
  };

  const handleExportARM = async () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      const result = await exportARMTemplate(items, connections, {
        environment: 'production',
        region: selectedRegion
      });
      
      alert(`✅ ARM Template exported successfully!\n\n📦 Files generated:\n${result.files.map(f => `  • ${f}`).join('\n')}\n\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting ARM Template:', error);
      alert(`❌ Failed to export ARM Template!\n\n${error.message}`);
    }
  };
  
  const handleExportCostReport = async () => {
    if (items.length === 0) {
      alert('No items on canvas! Please add Azure services first. ❌');
      return;
    }
    try {
      const result = await exportCostReport(items, selectedRegion, selectedCurrency, {
        environment: 'production'
      });
      
      alert(`✅ Cost report exported successfully!\n\n📁 ${result.filename}\n🌍 Region: ${result.region}\n💱 Currency: ${result.currency}\n📊 ${result.itemCount} services analyzed`);
    } catch (error) {
      console.error('Error exporting cost report:', error);
      alert(`❌ Failed to export cost report!\n\n${error.message}`);
    }
  };

  const handleImportTerraform = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tf,.tfvars';
    input.multiple = true;

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const readers = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve({ name: file.name, content: ev.target.result });
          reader.onerror = () => reject(new Error('Failed to read ' + file.name));
          reader.readAsText(file);
        });
      });

      Promise.all(readers).then(results => {
        try {
          const combined = results.map(r => '# File: ' + r.name + '\n' + r.content).join('\n\n');
          const parsed = parseTerraform(combined);

          if (parsed.items.length === 0) {
            alert('No Azure resources found in the Terraform files.');
            return;
          }

          let mode = 'replace';
          if (items.length > 0) {
            const choice = window.confirm('Canvas has existing items.\n\nOK = Replace all\nCancel = Merge');
            mode = choice ? 'replace' : 'merge';
          }

          if (mode === 'replace') {
            setItems(parsed.items);
            setConnections(parsed.connections);
          } else {
            const offsetItems = parsed.items.map((item, idx) => ({
              ...item,
              id: 'tf-merge-' + Date.now() + '-' + idx,
              x: item.x + 600,
            }));
            const idMap = {};
            parsed.items.forEach((orig, idx) => { idMap[orig.id] = offsetItems[idx].id; });
            const offsetConns = parsed.connections.map((conn, idx) => ({
              ...conn,
              id: 'tf-conn-merge-' + Date.now() + '-' + idx,
              from: idMap[conn.from] || conn.from,
              to: idMap[conn.to] || conn.to,
            }));
            setItems(prev => [...prev, ...offsetItems]);
            setConnections(prev => [...prev, ...offsetConns]);
          }

          const fileNames = results.map(r => r.name).join(', ');
          alert('Terraform imported! ' + parsed.items.length + ' resources, ' + parsed.connections.length + ' connections from ' + fileNames);
        } catch (error) {
          console.error('Terraform parse error:', error);
          alert('Failed to parse Terraform: ' + error.message);
        }
      }).catch(error => {
        alert('Failed to read files: ' + error.message);
      });
    };

    input.click();
  };

  return (
    <div className="app">      <ControlPanel
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={handleClear}
        onValidate={handleValidate}
        onExport={handleExport}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportTerraform={handleExportTerraform}
        onExportARM={handleExportARM}
        onExportCostReport={handleExportCostReport}
        onImportTerraform={handleImportTerraform}
      />      <HelpOverlay />
      <div className="main-content">
        <Toolbar />
        <CanvasComponent
          items={items}
          setItems={setItems}
          connections={connections}          setConnections={setConnections}
          canvasRef={canvasRef}
        />
        <CostSummary 
          items={items} 
          onRegionChange={setSelectedRegion}
          onCurrencyChange={setSelectedCurrency}
        />
      </div>
      <Footer />
      <ValidationPanel 
        items={items}
        connections={connections}
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />
    </div>
  );
}

export default App;
