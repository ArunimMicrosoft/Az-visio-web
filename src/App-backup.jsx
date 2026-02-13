// Backup of the original App.jsx before debugging
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import HelpOverlay from './components/HelpOverlay';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('App mounted successfully!');
    console.log('Items:', items);
    console.log('Connections:', connections);
  }, [items, connections]);

  // Error boundary
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error:', event.error);
      setError(event.error?.message || 'Unknown error');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
        <h1>Error occurred:</h1>
        <pre>{error}</pre>
      </div>
    );
  }

  // Save diagram to localStorage
  const handleSave = () => {
    const diagram = { items, connections };
    localStorage.setItem('azureDiagram', JSON.stringify(diagram));
    alert('Diagram saved successfully! ✅');
  };

  // Load diagram from localStorage
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

  // Clear the canvas
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      setItems([]);
      setConnections([]);
    }
  };

  // Export diagram as JSON
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

  // Export diagram as PNG
  const handleExportPNG = async () => {
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }

      // Capture only the canvas
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        ignoreElements: (element) => {
          // Ignore help overlay, buttons, and hints
          return element.classList.contains('help-overlay') || 
                 element.classList.contains('help-button') ||
                 element.classList.contains('connecting-status') ||
                 element.classList.contains('canvas-placeholder');
        }
      });

      // Convert to PNG and download
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

  // Export diagram as PDF
  const handleExportPDF = async () => {
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }

      // Capture only the canvas
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

      // Create PDF
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

  return (
    <div className="app">
      <ControlPanel
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={handleClear}
        onExport={handleExport}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
      />
      <HelpOverlay />
      <div className="main-content">
        <Toolbar />
        <Canvas
          items={items}
          setItems={setItems}
          connections={connections}
          setConnections={setConnections}
          canvasRef={canvasRef}
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;
