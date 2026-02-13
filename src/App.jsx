import { useState, useRef } from 'react';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/Canvas-new.jsx';
import ControlPanel from './components/ControlPanel';
import HelpOverlay from './components/HelpOverlay';
import Footer from './components/Footer';
import CostSummary from './components/CostSummary';
import { 
  exportJSON, 
  exportPNG, 
  exportPDF, 
  exportTerraform, 
  exportARMTemplate,
  exportCostReport 
} from './utils/enterpriseExporter';
import './App.css';

console.log('=== APP.JSX LOADING ===');
console.log('Imports loaded successfully');

function App() {
  console.log('=== APP FUNCTION EXECUTING ===');
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('eastus');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const canvasRef = useRef(null);

  const handleSave = () => {
    const diagram = { items, connections };
    localStorage.setItem('azureDiagram', JSON.stringify(diagram));
    alert('Diagram saved successfully! ✅');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('azureDiagram');
    if (saved) {
      const diagram = JSON.parse(saved);
      setItems(diagram.items || []);
      setConnections(diagram.connections || []);
      alert('Diagram loaded successfully! ✅');
    } else {
      alert('No saved diagram found! ❌');
    }
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
  return (
    <div className="app">
      <ControlPanel
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={handleClear}
        onExport={handleExport}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportTerraform={handleExportTerraform}
        onExportARM={handleExportARM}
        onExportCostReport={handleExportCostReport}
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
    </div>
  );
}

export default App;
