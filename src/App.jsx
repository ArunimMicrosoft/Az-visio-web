import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/Canvas-new.jsx';
import ControlPanel from './components/ControlPanel';
import HelpOverlay from './components/HelpOverlay';
import Footer from './components/Footer';
import CostSummary from './components/CostSummary';
import { downloadTerraform } from './utils/terraformGenerator';
import { downloadARMTemplate } from './utils/armTemplateGenerator';
import { generateCostPDF } from './utils/costPDFGenerator';
import './App.css';

console.log('=== APP.JSX LOADING ===');
console.log('Imports loaded successfully');

function App() {
  console.log('=== APP FUNCTION EXECUTING ===');
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
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

  const handleExport = () => {
    const diagram = { items, connections };
    const dataStr = JSON.stringify(diagram, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'azure-architecture.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }

      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        ignoreElements: (element) => {
          return element.classList.contains('help-overlay') || 
                 element.classList.contains('help-button') ||
                 element.classList.contains('connecting-status') ||
                 element.classList.contains('canvas-placeholder');
        }
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `azure-architecture-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        alert('PNG exported successfully! 🖼️✅');
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export PNG! ❌');
    }
  };
  const handleExportPDF = async () => {
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }

      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        ignoreElements: (element) => {
          return element.classList.contains('help-overlay') || 
                 element.classList.contains('help-button') ||
                 element.classList.contains('connecting-status') ||
                 element.classList.contains('canvas-placeholder');
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`azure-architecture-${Date.now()}.pdf`);
      alert('PDF exported successfully! 📄✅');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF! ❌');
    }
  };

  const handleExportTerraform = () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      downloadTerraform(items, connections);
      alert('Terraform configuration exported successfully! 🏗️✅');
    } catch (error) {
      console.error('Error exporting Terraform:', error);
      alert('Failed to export Terraform configuration! ❌');
    }
  };

  const handleExportARM = () => {
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      downloadARMTemplate(items, connections);
      alert('ARM Template exported successfully! 📋✅');
    } catch (error) {
      console.error('Error exporting ARM Template:', error);
      alert('Failed to export ARM Template! ❌');
    }
  };  const handleExportCostReport = () => {
    if (items.length === 0) {
      alert('No items on canvas! Please add Azure services first. ❌');
      return;
    }
    try {
      console.log('Starting PDF generation with items:', items);
      const fileName = generateCostPDF(items);
      console.log('PDF generated successfully:', fileName);
      alert('Cost report PDF generated successfully! 💰✅');
    } catch (error) {
      console.error('Error generating cost PDF:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to generate cost report PDF! ❌\n\nError: ${error.message}`);
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
          connections={connections}
          setConnections={setConnections}
          canvasRef={canvasRef}
        />
        <CostSummary items={items} />
      </div>
      <Footer />
    </div>
  );
}

export default App;
