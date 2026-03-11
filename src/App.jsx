import { useState, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import Toolbar from './components/Toolbar';
import CanvasComponent from './components/Canvas.jsx';
import ControlPanel from './components/ControlPanel';
import HelpOverlay from './components/HelpOverlay';
import Footer from './components/Footer';
import CostSummary from './components/CostSummary';
import ValidationPanel from './components/ValidationPanel';
import TrialBanner from './components/TrialBanner';
import UpgradeModal from './components/UpgradeModal';
import { 
  exportJSON, 
  exportPNG, 
  exportPDF, 
  exportTerraform, 
  exportARMTemplate,
  exportCostReport 
} from './utils/enterpriseExporter';
import { 
  canExportPNG, 
  canCreateDiagram, 
  recordPNGExport, 
  recordDiagramCreation
} from './utils/authSecurity';
import { parseTerraformFile, validateTerraformFile } from './utils/terraformParser';
import { validateArchitecture } from './utils/azureArchitectureValidator';
import './App.css';

console.log('=== APP.JSX LOADING ===');
console.log('Imports loaded successfully');

function App() {
  console.log('=== APP FUNCTION EXECUTING ===');
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('eastus');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const canvasRef = useRef(null);

  // Helper function to check diagram creation limit
  const checkDiagramLimit = () => {
    const diagramCheck = canCreateDiagram(user);
    if (!diagramCheck.allowed) {
      setUpgradeReason(diagramCheck.reason);
      setUpgradeFeature('Unlimited Diagrams');
      setUpgradeModalOpen(true);
      return false;
    }
    return true;
  };

  // Wrapper for setItems to enforce diagram limits
  const handleSetItems = (itemsOrUpdater) => {
    // Check if this is adding new items
    if (typeof itemsOrUpdater === 'function') {
      setItems(prev => {
        const newItems = itemsOrUpdater(prev);
        // If items increased, check limit
        if (newItems.length > prev.length && user?.subscriptionTier === 'trial') {
          // Count unique diagrams (simplified - checking total items)
          if (prev.length === 0 && newItems.length > 0) {
            // New diagram started
            if (!checkDiagramLimit()) {
              return prev; // Don't add items
            }
            recordDiagramCreation(user.id);
          }
        }
        return newItems;
      });
    } else {
      setItems(itemsOrUpdater);
    }
  };

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
        boundaries,
        metadata: {
          version: '1.0',
          savedAt: new Date().toISOString(),
          itemCount: items.length,
          connectionCount: connections.length,
          boundaryCount: boundaries.length,
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
          handleSetItems(diagram.items || []);
          setConnections(diagram.connections || []);
          setBoundaries(diagram.boundaries || []);

          const itemCount = diagram.items.length;
          const connCount = (diagram.connections || []).length;
          const boundaryCount = (diagram.boundaries || []).length;
          const savedDate = diagram.metadata?.savedAt 
            ? new Date(diagram.metadata.savedAt).toLocaleString()
            : 'Unknown';
          
          alert(`✅ Diagram loaded successfully!\n\n📁 File: ${file.name}\n📊 ${itemCount} services, ${connCount} connections, ${boundaryCount} boundaries\n📅 Saved: ${savedDate}`);
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
      handleSetItems([]);
      setConnections([]);
      setBoundaries([]);
    }
  };

  const handleImportTerraform = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tf,.tf.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const validation = validateTerraformFile(content, file.name);
          if (!validation.valid) {
            alert(`❌ Invalid Terraform file!\n\n${validation.errors.join('\n')}`);
            return;
          }
          const result = parseTerraformFile(content, file.name);
          if (result.items.length === 0) {
            alert('⚠️ No Azure resources found!');
            return;
          }
          handleSetItems(prev => [...prev, ...result.items]);
          setConnections(prev => [...prev, ...result.connections]);
          alert(`✅ Imported ${result.items.length} Azure resources from Terraform!\n\n💰 Costs calculated from actual Azure pricing.`);
        } catch (error) {
          alert(`❌ Error: ${error.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  // Helper: Run architecture validation and return result
  const getValidationResult = () => {
    try {
      return validateArchitecture(items, connections, boundaries);
    } catch (e) {
      return { isValid: false, errors: ['Validation failed: ' + e.message], score: 0, summary: { errors: 1, warnings: 0 } };
    }
  };

  // Helper: Show modal or alert for compliance issues
  const showComplianceBlock = (validation, exportType) => {
    if (!validation.isValid) {
      alert(`❌ Export blocked: Critical architecture errors detected.\n\nPlease fix all errors before exporting ${exportType}.\n\nErrors:\n- ` + (validation.errors || []).join('\n- '));
      return true;
    }
    return false;
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
    // Trial Check
    const exportCheck = canExportPNG(user);
    if (!exportCheck.allowed) {
      setUpgradeReason(exportCheck.reason);
      setUpgradeFeature('PNG Export');
      setUpgradeModalOpen(true);
      return;
    }

    const validation = getValidationResult();
    if (showComplianceBlock(validation, 'PNG')) return;

    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }

    // Show remaining exports for trial users
    if (exportCheck.remaining !== undefined) {
      const proceed = window.confirm(
        `PNG Export (${exportCheck.remaining - 1} exports remaining after this)\n\n` +
        `Click OK to continue or Cancel to upgrade.`
      );
      if (!proceed) {
        setUpgradeReason('Upgrade for unlimited PNG exports');
        setUpgradeFeature('Unlimited PNG Export');
        setUpgradeModalOpen(true);
        return;
      }
    }

    // DPI selector dialog
    const dpiChoice = prompt(
      '📐 Select PNG Export Quality:\n\n' +
      '1 — Screen (72 DPI) — Smallest file, good for presentations\n' +
      '2 — Web (96 DPI) — Standard web quality (default)\n' +
      '3 — Draft Print (150 DPI) — Draft-quality print\n' +
      '4 — High-Quality Print (300 DPI) — Professional printing\n' +
      '5 — Poster (600 DPI) — Large-format printing\n\n' +
      'Enter 1-5 (or press Enter for Web 96 DPI):',
      '2'
    );

    if (dpiChoice === null) return; // User cancelled

    const dpiMap = { '1': 'screen', '2': 'web', '3': 'draft', '4': 'print', '5': 'poster' };
    const selectedDPI = dpiMap[dpiChoice.trim()] || 'web';

    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;
      }      const result = await exportPNG(canvasElement, items, connections, boundaries, {
        quality: 'high',
        environment: 'production',
        dpi: selectedDPI,
        validationSummary: validation,
        author: 'Arunim Pandey',
        version: '2.0.0',
        timestamp: new Date().toISOString(),      });
        // Record export for trial users and refresh user state immediately
      await recordPNGExport(user.id);
      await refreshUser(); // sync updated count from DB → memory
      
      alert(`✅ PNG exported successfully!\n\n📁 ${result.filename}\n📐 ${result.dimensions.width}×${result.dimensions.height}px\n🔬 ${result.dpi} DPI (${result.dpiSetting})\n📊 ${(result.size / 1024).toFixed(1)} KB`);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert(`❌ Failed to export PNG!\n\n${error.message}`);
    }
  };
  
  const handleExportPDF = async () => {
    // Trial users cannot export PDF
    if (user?.subscriptionTier === 'trial') {
      setUpgradeReason('PDF export is not available in trial version. Upgrade to Professional or Enterprise plan.');
      setUpgradeFeature('PDF Export');
      setUpgradeModalOpen(true);
      return;
    }

    const validation = getValidationResult();
    if (showComplianceBlock(validation, 'PDF')) return;

    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        alert('Canvas not found! ❌');
        return;      }      const result = await exportPDF(canvasElement, items, connections, boundaries, {
        title: 'Azure Architecture Diagram',
        author: 'Arunim Pandey',
        environment: 'production',
        region: selectedRegion,
        validationSummary: validation,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
      
      alert(`✅ PDF exported successfully!\n\n📁 ${result.filename}\n📄 ${result.pages} pages\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`❌ Failed to export PDF!\n\n${error.message}`);
    }
  };
  const handleExportTerraform = async () => {
    // Trial users cannot export Terraform
    if (user?.subscriptionTier === 'trial') {
      setUpgradeReason('Terraform export is not available in trial version. Upgrade to Professional or Enterprise plan.');
      setUpgradeFeature('Terraform Export');
      setUpgradeModalOpen(true);
      return;
    }

    const validation = getValidationResult();
    if (showComplianceBlock(validation, 'Terraform')) return;

    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }try {
      const result = await exportTerraform(items, connections, boundaries, {
        environment: 'production',
        region: selectedRegion,
        validationSummary: validation,
        author: 'Arunim Pandey',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
      
      alert(`✅ Terraform configuration exported successfully!\n\n📦 Files generated:\n${result.files.map(f => `  • ${f}`).join('\n')}\n\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting Terraform:', error);
      alert(`❌ Failed to export Terraform!\n\n${error.message}`);
    }
  };
  const handleExportARM = async () => {
    // Trial users cannot export ARM
    if (user?.subscriptionTier === 'trial') {
      setUpgradeReason('ARM Template export is not available in trial version. Upgrade to Professional or Enterprise plan.');
      setUpgradeFeature('ARM Template Export');
      setUpgradeModalOpen(true);
      return;
    }

    const validation = getValidationResult();
    if (showComplianceBlock(validation, 'ARM Template')) return;

    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }try {
      const result = await exportARMTemplate(items, connections, boundaries, {
        environment: 'production',
        region: selectedRegion,
        validationSummary: validation,
        author: 'Arunim Pandey',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
      
      alert(`✅ ARM Template exported successfully!\n\n📦 Files generated:\n${result.files.map(f => `  • ${f}`).join('\n')}\n\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
    } catch (error) {
      console.error('Error exporting ARM Template:', error);
      alert(`❌ Failed to export ARM Template!\n\n${error.message}`);
    }  };
  
  const handleExportCostReport = async () => {
    // Trial users cannot export Cost Report
    if (user?.subscriptionTier === 'trial') {
      setUpgradeReason('Cost Report export is not available in trial version. Upgrade to Professional or Enterprise plan.');
      setUpgradeFeature('Cost Report Export');
      setUpgradeModalOpen(true);
      return;
    }

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
      <TrialBanner user={user} />
      <ControlPanel
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
      />
      <UpgradeModal 
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        reason={upgradeReason}
        feature={upgradeFeature}
      />
      <HelpOverlay />
      <div className="main-content">
        <Toolbar />
        <CanvasComponent
          items={items}
          setItems={handleSetItems}
          connections={connections}
          setConnections={setConnections}
          boundaries={boundaries}
          setBoundaries={setBoundaries}
          canvasRef={canvasRef}
        />
        <CostSummary 
          items={items} 
          onRegionChange={setSelectedRegion}
          onCurrencyChange={setSelectedCurrency}
          useRealTimeAPI={true}
        />
      </div>
      <Footer />      <ValidationPanel 
        items={items}
        connections={connections}
        boundaries={boundaries}
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />
    </div>
  );
}

export default App;
