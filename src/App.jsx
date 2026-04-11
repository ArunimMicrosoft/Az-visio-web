import { useState, useRef, useEffect } from 'react';
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
import TemplateGallery from './components/TemplateGallery';
import VersionHistoryPanel from './components/VersionHistoryPanel';
import PresentationMode from './components/PresentationMode';
import RegionCompare from './components/RegionCompare';
import MyDiagrams from './components/MyDiagrams';
import TrialWatermark from './components/TrialWatermark';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useVersionHistory } from './hooks/useVersionHistory';
import { exportBicepFile } from './utils/bicepGenerator';
import { writeAuditLog } from './utils/supabase';
import { trackActive, trackExport, trackTemplateUsed, trackValidation, trackReferral } from './utils/activityTracker';
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
  recordPNGExport, 
  recordDiagramCreation,
  isAdminUser
} from './utils/authSecurity';
import { parseTerraformFile, validateTerraformFile } from './utils/terraformParser';
import { validateArchitecture } from './utils/azureArchitectureValidator';
import './App.css';

function App() {
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

  // New feature state
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [regionCompareOpen, setRegionCompareOpen] = useState(false);
  const [myDiagramsOpen, setMyDiagramsOpen] = useState(false);

  // Hooks
  const undoRedo = useUndoRedo();
  const versionHistory = useVersionHistory();

  const canvasRef = useRef(null);
  // Tracks whether the current canvas session has already been counted as a diagram
  const diagramCountedThisSession = useRef(false);
  // Refresh user from DB on mount so banner shows correct counts immediately
  useEffect(() => {
    if (user?.id) {
      refreshUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Session heartbeat — captures device/IP info once per session for existing logged-in users
  useEffect(() => {
    if (!user?.id) return;
    const heartbeatKey = 'ccd_heartbeat_' + user.id;
    const lastBeat = sessionStorage.getItem(heartbeatKey);
    if (lastBeat) return; // already sent this session
    sessionStorage.setItem(heartbeatKey, Date.now().toString());
    trackActive(user.id);
    trackReferral(user.id);
    writeAuditLog({
      userId: user.id,
      email: user.email,
      event: 'SESSION_ACTIVE',
      details: { source: 'app_load' },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Listen for PAYMENT_SUCCESS message from the payment tab (opened via UpgradeModal).
  // When received, refresh the user so the trial banner disappears immediately
  // without losing any canvas state (items, connections, boundaries).
  useEffect(() => {
    const handlePaymentMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'PAYMENT_SUCCESS') {
        await refreshUser();
      }
    };
    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watermark replaces aggressive screenshot blocking for trial users
  // (TrialWatermark component handles the visual overlay)

  // Keyboard shortcuts: Undo (Ctrl+Z), Redo (Ctrl+Y/Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prev = undoRedo.undo();
        if (prev) {
          isLoadingDiagram.current = true;
          setItems(prev.items);
          setConnections(prev.connections);
          setBoundaries(prev.boundaries);
          isLoadingDiagram.current = false;
        }
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const next = undoRedo.redo();
        if (next) {
          isLoadingDiagram.current = true;
          setItems(next.items);
          setConnections(next.connections);
          setBoundaries(next.boundaries);
          isLoadingDiagram.current = false;
        }
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undoRedo]);  // isLoadingDiagram ref — when true, skip trial diagram limit (user is loading saved file)
  const isLoadingDiagram = useRef(false);

  // Wrapper for setItems — blocks NEW drawing if trial diagram limit (3) reached.
  // Load and Clear are never blocked.
  const handleSetItems = (itemsOrUpdater) => {
    if (typeof itemsOrUpdater === 'function') {
      setItems(prev => {
        const newItems = itemsOrUpdater(prev);
        const isAdding = newItems.length > prev.length;        // Only block drag-drop (not load/terraform import) when trial limit reached
        if (isAdding && !isLoadingDiagram.current && user?.subscriptionTier === 'trial' && !isAdminUser(user)) {
          const diagramsUsed = user?.diagramsCreated || 0;
          if (diagramsUsed >= 3 && !diagramCountedThisSession.current) {
            setTimeout(() => {
              setUpgradeReason('You have used all 3 trial diagrams. Upgrade for unlimited diagrams.');
              setUpgradeFeature('Unlimited Diagrams');
              setUpgradeModalOpen(true);
            }, 0);
            return prev;
          }
        }

        return newItems;
      });
    } else {
      // Direct set (load / clear) — reset session tracker
      diagramCountedThisSession.current = false;
      setItems(itemsOrUpdater);
    }
  };
  // Count a diagram for trial users on first export of a session, then refresh banner
  const countDiagramIfTrial = async () => {
    if (user?.subscriptionTier === 'trial' && !isAdminUser(user) && !diagramCountedThisSession.current) {
      diagramCountedThisSession.current = true;
      await recordDiagramCreation(user.id);
      await refreshUser(); // updates banner: 3/3 → 2/3 → 1/3 → 0/3
    }
  };

  // Record undo/redo snapshot when canvas state changes (debounced)
  const recordTimeout = useRef(null);
  useEffect(() => {
    if (recordTimeout.current) clearTimeout(recordTimeout.current);
    recordTimeout.current = setTimeout(() => {
      if (items.length > 0 || connections.length > 0) {
        undoRedo.record({ items, connections, boundaries });
      }
    }, 500);
    return () => clearTimeout(recordTimeout.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, connections, boundaries]);

  // === NEW FEATURE HANDLERS ===

  // Helper: Ask user to Replace or Add when canvas has items.
  // Returns 'replace' | 'add' | null (cancelled).
  // When canvas is empty, returns 'replace' silently.
  const askReplaceOrAdd = (label = 'items') => {
    if (items.length === 0) return 'replace';
    const choice = window.prompt(
      `Canvas already has ${items.length} services.\n\n` +
      `Type R to Replace canvas with new ${label}\n` +
      `Type A to Add new ${label} to existing canvas\n` +
      `Press Cancel to abort`,
      'A'
    );
    if (choice === null) return null;
    const c = choice.trim().toUpperCase();
    if (c === 'R' || c === 'REPLACE') return 'replace';
    return 'add'; // default to add
  };

  // Helper: Merge new items onto canvas with X offset to avoid overlap
  const addToCanvas = (newItems, newConnections, newBoundaries) => {
    // Calculate offset: place new items to the right of existing ones
    const maxX = items.reduce((max, i) => Math.max(max, i.x || 0), 0);
    const offset = maxX > 0 ? maxX + 200 : 0;

    const offsetItems = newItems.map(i => ({ ...i, x: (i.x || 0) + offset }));
    isLoadingDiagram.current = true;
    handleSetItems(prev => [...prev, ...offsetItems]);
    setConnections(prev => [...prev, ...(newConnections || [])]);
    if (newBoundaries && newBoundaries.length > 0) {
      setBoundaries(prev => [...prev, ...newBoundaries]);
    }
    isLoadingDiagram.current = false;
  };

  // Template selection handler
  const handleSelectTemplate = (template) => {
    const mode = askReplaceOrAdd('template');
    if (!mode) return;
    trackTemplateUsed(user?.id);
    if (mode === 'replace') {
      isLoadingDiagram.current = true;
      handleSetItems(template.items);
      setConnections(template.connections || []);
      setBoundaries(template.boundaries || []);
      isLoadingDiagram.current = false;
    } else {
      addToCanvas(template.items, template.connections, template.boundaries);
    }
  };

  // Version history handlers
  const handleSaveVersion = (name) => {
    versionHistory.saveVersion(name, { items, connections, boundaries });
  };

  const handleRestoreVersion = (versionId) => {
    const state = versionHistory.restoreVersion(versionId);
    if (state) {
      isLoadingDiagram.current = true;
      handleSetItems(state.items);
      setConnections(state.connections);
      setBoundaries(state.boundaries);
      isLoadingDiagram.current = false;
    }
  };

  // Undo/Redo button handlers
  const handleUndo = () => {
    const prev = undoRedo.undo();
    if (prev) {
      isLoadingDiagram.current = true;
      setItems(prev.items);
      setConnections(prev.connections);
      setBoundaries(prev.boundaries);
      isLoadingDiagram.current = false;
    }
  };

  const handleRedo = () => {
    const next = undoRedo.redo();
    if (next) {
      isLoadingDiagram.current = true;
      setItems(next.items);
      setConnections(next.connections);
      setBoundaries(next.boundaries);
      isLoadingDiagram.current = false;
    }
  };

  // Bicep export handler
  const handleExportBicep = () => {
    if (user?.subscriptionTier === 'trial') {
      setUpgradeReason('Bicep export is not available in trial version. Upgrade to Professional or Enterprise plan.');
      setUpgradeFeature('Bicep Export');
      setUpgradeModalOpen(true);
      return;
    }
    if (items.length === 0) {
      alert('No items on canvas to export! Please add Azure services first. ❌');
      return;
    }
    const validation = getValidationResult();
    if (showComplianceBlock(validation, 'Bicep')) return;
    try {
      const result = exportBicepFile(items, connections, boundaries, { region: selectedRegion });
      trackExport(user?.id, 'bicep');
      alert(`✅ Bicep template exported!\n\n📁 ${result.filename}\n📊 ${result.itemCount} services`);
    } catch (error) {
      alert(`❌ Failed to export Bicep!\n\n${error.message}`);
    }
  };

  // Cloud diagram load handler
  const handleLoadCloudDiagram = (diagram) => {
    const mode = askReplaceOrAdd('cloud diagram');
    if (!mode) return;
    if (mode === 'replace') {
      isLoadingDiagram.current = true;
      handleSetItems(diagram.items || []);
      setConnections(diagram.connections || []);
      setBoundaries(diagram.boundaries || []);
      isLoadingDiagram.current = false;
    } else {
      addToCanvas(diagram.items || [], diagram.connections || [], diagram.boundaries || []);
    }
  };

  const handleValidate = () => {
    if (items.length === 0) {
      alert('⚠️ Canvas is empty! Add Azure services to validate the architecture.');
      return;
    }
    trackValidation(user?.id);
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
          appName: 'Cloud Canvas Designer'
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

          const mode = askReplaceOrAdd('diagram');
          if (!mode) return;

          isLoadingDiagram.current = true;
          if (mode === 'replace') {
            handleSetItems(diagram.items || []);
            setConnections(diagram.connections || []);
            setBoundaries(diagram.boundaries || []);
          } else {
            addToCanvas(diagram.items || [], diagram.connections || [], diagram.boundaries || []);
          }
          isLoadingDiagram.current = false;

          const itemCount = diagram.items.length;
          const connCount = (diagram.connections || []).length;
          const boundaryCount = (diagram.boundaries || []).length;
          const savedDate = diagram.metadata?.savedAt 
            ? new Date(diagram.metadata.savedAt).toLocaleString()
            : 'Unknown';
          
          alert(`✅ Diagram loaded successfully!\n\n📁 File: ${file.name}\n📊 ${itemCount} services, ${connCount} connections, ${boundaryCount} boundaries\n📅 Saved: ${savedDate}`);
        } catch (error) {
          console.error('Error loading diagram:', error);
          alert(`❌ Failed to load diagram!\n\n${error.message}\n\nPlease ensure the file is a valid Cloud Canvas Designer JSON file.`);
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

  // Called by TerraformPastePanel — result is already parsed by the panel
  const handlePasteTerraformImport = (result) => {
    const mode = askReplaceOrAdd('Terraform resources');
    if (!mode) return;
    if (mode === 'replace') {
      isLoadingDiagram.current = true;
      handleSetItems(result.items);
      setConnections(result.connections || []);
      setBoundaries(result.boundaries || []);
      isLoadingDiagram.current = false;
    } else {
      addToCanvas(result.items, result.connections, result.boundaries || []);
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

          const mode = askReplaceOrAdd('Terraform resources');
          if (!mode) return;

          if (mode === 'replace') {
            isLoadingDiagram.current = true;
            handleSetItems(result.items);
            setConnections(result.connections || []);
            setBoundaries(result.boundaries || []);
            isLoadingDiagram.current = false;
          } else {
            addToCanvas(result.items, result.connections || [], result.boundaries || []);
          }
          alert(`✅ ${mode === 'add' ? 'Added' : 'Imported'} ${result.items.length} Azure resources from Terraform!\n\n💰 Costs calculated from actual Azure pricing.`);
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
    try {      const result = await exportJSON(items, connections, {
        environment: 'production',
        author: 'User',
        description: 'Azure Architecture Diagram'
      });
      await countDiagramIfTrial(); // count diagram on JSON export too
      await refreshUser();
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
        timestamp: new Date().toISOString(),      });        // Record export for trial users and refresh user state immediately
      await countDiagramIfTrial(); // counts diagram session (3→2→1→0) on first export
      await recordPNGExport(user.id);
      await refreshUser(); // sync updated counts from DB → banner
      trackExport(user?.id, 'png');
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
      trackExport(user?.id, 'pdf');
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
      trackExport(user?.id, 'terraform');
      alert(`✅ Terraform configuration exported!\n\n📦 Downloaded: ${result.files[0]}\n\nContains: main.tf · variables.tf · outputs.tf · terraform.tfvars · README.md\n\n📊 ${result.itemCount} services, ${result.connectionCount} connections`);
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
      trackExport(user?.id, 'arm');
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
  const isTrial = user?.subscriptionTier === 'trial' && !isAdminUser(user);

  return (
    <div className="app">
      <TrialWatermark isTrial={isTrial} />
      <TrialBanner user={user} />      <ControlPanel
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={handleClear}
        onValidate={handleValidate}
        onExport={handleExport}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportTerraform={handleExportTerraform}
        onExportARM={handleExportARM}
        onExportBicep={handleExportBicep}
        onExportCostReport={handleExportCostReport}
        onImportTerraform={handleImportTerraform}
        onPasteTerraform={handlePasteTerraformImport}
        onOpenTemplates={() => setTemplateGalleryOpen(true)}
        onOpenVersions={() => setVersionPanelOpen(true)}
        onOpenPresentation={() => setPresentationMode(true)}
        onOpenRegionCompare={() => setRegionCompareOpen(true)}
        onOpenMyDiagrams={() => setMyDiagramsOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
        isTrial={isTrial}
        onUpgrade={() => {
          setUpgradeReason('Terraform Paste is a Pro feature. Upgrade to paste HCL and generate diagrams instantly.');
          setUpgradeFeature('Terraform Paste');
          setUpgradeModalOpen(true);
        }}
      />      <UpgradeModal 
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        reason={upgradeReason}
        feature={upgradeFeature}
      />
      <HelpOverlay />
      <div className="main-content">
        <Toolbar />        <CanvasComponent
          items={items}
          setItems={handleSetItems}
          connections={connections}
          setConnections={setConnections}
          boundaries={boundaries}
          setBoundaries={setBoundaries}
          canvasRef={canvasRef}
          isTrial={isTrial}
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

      {/* New Feature Modals */}
      <TemplateGallery
        isOpen={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      <VersionHistoryPanel
        versions={versionHistory.versions}
        onSave={handleSaveVersion}
        onRestore={handleRestoreVersion}
        onDelete={versionHistory.deleteVersion}
        isOpen={versionPanelOpen}
        onClose={() => setVersionPanelOpen(false)}
      />
      <PresentationMode
        isOpen={presentationMode}
        onClose={() => setPresentationMode(false)}
        items={items}
        connections={connections}
        boundaries={boundaries}
        canvasRef={canvasRef}
      />
      <RegionCompare
        isOpen={regionCompareOpen}
        onClose={() => setRegionCompareOpen(false)}
        items={items}
        currency={selectedCurrency}
      />
      <MyDiagrams
        isOpen={myDiagramsOpen}
        onClose={() => setMyDiagramsOpen(false)}
        userId={user?.id}
        currentDiagram={{ items, connections, boundaries }}
        onLoadDiagram={handleLoadCloudDiagram}
      />
    </div>
  );
}

export default App;
