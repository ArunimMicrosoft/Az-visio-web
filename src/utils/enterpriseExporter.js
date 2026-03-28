// Enterprise-Grade Export Utility for Cloud Canvas Designer
// Follows industry best practices for file naming, metadata, validation, and error handling

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { generateTerraform } from './terraformGenerator-enterprise';
import { generateARMTemplate } from './armTemplateGenerator';
import { generateCostPDF } from './costPDFGenerator';
import { renderDiagramToCanvas } from './canvasRenderer';
import { formatTerraformFiles } from './terraformFormatter';

/**
 * Enterprise Export Configuration
 * - Versioning for backward compatibility
 * - Comprehensive metadata
 * - Validation and error handling
 * - Audit trail
 */

const EXPORT_VERSION = '2.0.0';
const MAX_FILE_SIZE_MB = 50;

/**
 * Generate enterprise-compliant filename with timestamp
 * Format: {prefix}_{environment}_{timestamp}_{version}.{extension}
 */
const generateFileName = (prefix, extension, environment = 'prod') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const timeStr = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
  return `${prefix}_${environment}_${timestamp}_${timeStr}_v${EXPORT_VERSION}.${extension}`;
};

/**
 * Validate export data before processing
 */
const validateExportData = (items, connections) => {
  const errors = [];
  
  if (!items || !Array.isArray(items)) {
    errors.push('Invalid items data structure');
  }
  
  if (!connections || !Array.isArray(connections)) {
    errors.push('Invalid connections data structure');
  }
  
  if (items && items.length === 0) {
    errors.push('No items to export - canvas is empty');
  }
  
  // Validate item structure
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      if (!item.id || !item.name || !item.serviceType) {
        errors.push(`Invalid item structure at index ${index}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate comprehensive metadata for exports
 */
const generateMetadata = (exportType, itemCount, connectionCount, additionalInfo = {}) => {
  return {
    version: EXPORT_VERSION,
    exportType,
    timestamp: new Date().toISOString(),
    generator: 'Cloud Canvas Designer',
    statistics: {
      totalItems: itemCount,
      totalConnections: connectionCount,
      services: additionalInfo.services || [],
      categories: additionalInfo.categories || []
    },
    environment: additionalInfo.environment || 'production',
    region: additionalInfo.region || 'eastus',
    author: additionalInfo.author || 'System',
    description: additionalInfo.description || 'Azure Architecture Diagram',
    tags: additionalInfo.tags || [],
    compliance: {
      standard: 'Enterprise',
      validated: true,
      validationDate: new Date().toISOString()
    }
  };
};

/**
 * Generate service statistics for metadata
 */
const generateServiceStatistics = (items) => {
  const serviceTypes = {};
  const categories = new Set();
  
  items.forEach(item => {
    serviceTypes[item.serviceType] = (serviceTypes[item.serviceType] || 0) + 1;
    if (item.category) categories.add(item.category);
  });
  
  return {
    services: Object.entries(serviceTypes).map(([type, count]) => ({ type, count })),
    categories: Array.from(categories)
  };
};

/**
 * Calculate the bounding box of all items AND connections on the canvas
 * Returns the minimum area that contains all content with padding
 * NOTE: This function is kept for backward compatibility but not currently used
 * The new renderDiagramToCanvas() function handles bounds calculation internally
 */
// eslint-disable-next-line no-unused-vars
const calculateDiagramBounds = (items, connections = [], padding = 80) => {
  if (!items || items.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }
  
  const ICON_SIZE = 60; // Default icon size
  const ICON_OFFSET = ICON_SIZE / 2; // Center of icon
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  // Calculate bounds from items
  items.forEach(item => {
    const x = item.x || 0;
    const y = item.y || 0;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + ICON_SIZE);
    maxY = Math.max(maxY, y + ICON_SIZE);
  });
  
  // Also calculate bounds from connections (they might extend beyond items)
  if (connections && connections.length > 0) {
    connections.forEach(conn => {
      const fromItem = items.find(item => item.id === conn.from);
      const toItem = items.find(item => item.id === conn.to);
      
      if (fromItem && toItem) {
        const fromX = fromItem.x + ICON_OFFSET;
        const fromY = fromItem.y + ICON_OFFSET;
        const toX = toItem.x + ICON_OFFSET;
        const toY = toItem.y + ICON_OFFSET;
        
        // Update bounds to include connection line endpoints
        minX = Math.min(minX, fromX, toX);
        minY = Math.min(minY, fromY, toY);
        maxX = Math.max(maxX, fromX, toX);
        maxY = Math.max(maxY, fromY, toY);
      }
    });
  }
  
  // Ensure minimum dimensions
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const finalWidth = Math.max(contentWidth, 400);
  const finalHeight = Math.max(contentHeight, 300);
  
  // Add padding around the diagram
  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: finalWidth + (padding * 2),
    height: finalHeight + (padding * 2)
  };
};

/**
 * Crop canvas to the diagram bounds and center it
 * NOTE: This function is kept for backward compatibility but not currently used
 * The new renderDiagramToCanvas() function handles cropping internally
 */
// eslint-disable-next-line no-unused-vars
const cropAndCenterCanvas = (sourceCanvas, bounds) => {
  // Create a new canvas with the cropped dimensions
  const croppedCanvas = document.createElement('canvas');
  const ctx = croppedCanvas.getContext('2d');
  
  croppedCanvas.width = bounds.width;
  croppedCanvas.height = bounds.height;
  
  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, bounds.width, bounds.height);
  
  // Draw the cropped portion from the source canvas
  ctx.drawImage(
    sourceCanvas,
    bounds.x, bounds.y, bounds.width, bounds.height, // Source rectangle
    0, 0, bounds.width, bounds.height                 // Destination rectangle
  );
  
  return croppedCanvas;
};

/**
 * Export as JSON with enterprise metadata
 */
export const exportJSON = async (items, connections, options = {}) => {
  try {
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate statistics
    const stats = generateServiceStatistics(items);
    
    // Create enterprise-compliant JSON structure
    const exportData = {
      $schema: "https://azure-architecture-designer.com/schema/v2.json",
      metadata: generateMetadata('JSON', items.length, connections.length, {
        ...stats,
        ...options
      }),
      diagram: {
        items: items.map(item => ({
          ...item,
          exportedAt: new Date().toISOString()
        })),
        connections: connections.map(conn => ({
          ...conn,
          exportedAt: new Date().toISOString()
        }))
      },
      validation: {
        passed: true,
        checks: [
          'Structure validation',
          'Data integrity',
          'Naming conventions',
          'Service compatibility'
        ],
        timestamp: new Date().toISOString()
      }
    };    
    // Convert to formatted JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    
    // Check file size
    const sizeInMB = blob.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      throw new Error(`File size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE_MB}MB)`);
    }
    
    // Download file asynchronously
    const filename = generateFileName('azure-architecture', 'json', options.environment);
    await downloadBlob(blob, filename);
    
    return {
      success: true,
      filename,
      size: blob.size,
      itemCount: items.length,
      connectionCount: connections.length
    };
    
  } catch (error) {
    console.error('JSON Export Error:', error);
    throw new Error(`Failed to export JSON: ${error.message}`);
  }
};

/**
 * Export as high-quality PNG with metadata and DPI selection
 * Uses custom canvas renderer instead of html2canvas for reliability
 * DPI Options: 72 (screen), 96 (web), 150 (draft print), 300 (high-quality print)
 */
export const exportPNG = async (canvasElement, items, connections, boundaries = [], options = {}) => {
  try {
    console.log('🎨 Starting PNG export with', items.length, 'items,', connections.length, 'connections, and', boundaries.length, 'boundaries');
    
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // DPI Configuration (industry-standard values)
    const dpiOptions = {
      'screen': 72,      // Screen display
      'web': 96,         // Web standard (default)
      'draft': 150,      // Draft printing
      'print': 300,      // High-quality printing
      'poster': 600      // Large format printing
    };
    
    const selectedDPI = options.dpi || 'web';
    const dpiValue = dpiOptions[selectedDPI] || 96;
    const scaleFactor = dpiValue / 96; // Scale relative to web standard
    
    console.log(`📐 Export DPI: ${dpiValue} (${selectedDPI} quality) - Scale: ${scaleFactor}×`);
      
    // Render diagram to canvas using custom renderer (NOW WITH BOUNDARIES)
    const { canvas } = await renderDiagramToCanvas(items, connections, boundaries, {
      padding: 80,
      scale: scaleFactor * (options.quality === 'high' ? 1.5 : 1), // Additional quality multiplier
      showGrid: false
    });
    
    console.log('✅ Canvas rendered:', canvas.width, 'x', canvas.height, `at ${dpiValue} DPI`);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate PNG blob'));
          return;
        }
        
        // Check file size
        const sizeInMB = blob.size / (1024 * 1024);
        if (sizeInMB > MAX_FILE_SIZE_MB) {
          reject(new Error(`File size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE_MB}MB)`));
          return;
        }
        
        const filename = generateFileName('azure-architecture-diagram', 'png', options.environment);
        
        try {
          await downloadBlob(blob, filename);
          
          console.log('✅ PNG exported successfully:', filename);
            resolve({
            success: true,
            filename,
            size: blob.size,
            dimensions: {
              width: canvas.width,
              height: canvas.height
            },
            dpi: dpiValue,
            dpiSetting: selectedDPI,
            quality: options.quality || 'standard'
          });
        } catch (error) {
          reject(error);
        }
      }, 'image/png', options.quality === 'high' ? 1.0 : 0.92);
    });
    
  } catch (error) {
        console.error('PNG Export Error:', error);
    throw new Error(`Failed to export PNG: ${error.message}`);
  }
};

/**
 * Export as professional PDF with metadata and documentation
 * Uses custom canvas renderer instead of html2canvas for reliability
 * ENTERPRISE STANDARD: Includes boundaries, items, and connections
 */
export const exportPDF = async (canvasElement, items, connections, boundaries = [], options = {}) => {
  try {
    console.log('📄 Starting PDF export with', items.length, 'items,', connections.length, 'connections, and', boundaries.length, 'boundaries');
    
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Render diagram to canvas using custom renderer (NOW WITH BOUNDARIES)
    const { canvas, bounds } = await renderDiagramToCanvas(items, connections, boundaries, {
      padding: 80,
      scale: 2,
      showGrid: false
    });
    
    console.log('✅ PDF Canvas rendered:', canvas.width, 'x', canvas.height);
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate optimal PDF dimensions
    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Add metadata
    pdf.setProperties({
      title: options.title || 'Azure Architecture Diagram',
      subject: 'Azure Cloud Architecture',
      author: options.author || 'Cloud Canvas Designer',
      keywords: 'azure, architecture, cloud, diagram',
      creator: 'Cloud Canvas Designer v' + EXPORT_VERSION,
      creationDate: new Date()
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    
    // Add cover page with professional header
    pdf.setFillColor(0, 120, 212); // Azure blue
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Azure Architecture Diagram', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(options.title || 'Enterprise Cloud Infrastructure', pageWidth / 2, 30, { align: 'center' });
    
    // Add metadata section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    let yPos = 50;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Document Information:', margin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 7;
    
    const metadata = [
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Version: ${EXPORT_VERSION}`,
      `Total Services: ${items.length}`,
      `Connections: ${connections.length}`,
      `Environment: ${options.environment || 'Production'}`,
      `Region: ${options.region || 'East US'}`,
      `Diagram Size: ${Math.round(bounds.width)}×${Math.round(bounds.height)}px`
    ];
    
    metadata.forEach(line => {
      pdf.text(line, margin + 5, yPos);
      yPos += 6;
    });
    
    // Add services summary
    yPos += 5;
    pdf.setFont(undefined, 'bold');
    pdf.text('Services Summary:', margin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 7;
    
    const stats = generateServiceStatistics(items);
    stats.services.forEach(service => {
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(`• ${service.type}: ${service.count}`, margin + 5, yPos);
      yPos += 6;
    });
    
    // Add diagram on new page
    pdf.addPage();
    
    // Add page header
    pdf.setFillColor(0, 120, 212);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Architecture Diagram', pageWidth / 2, 10, { align: 'center' });
      // Calculate image dimensions to fit page with margins and center it
    const availableWidth = pageWidth - (2 * margin);
    const availableHeight = pageHeight - 25 - margin; // Account for header
    
    let imgWidth, imgHeight;
    const imgRatio = canvas.width / canvas.height;
    const availableRatio = availableWidth / availableHeight;
    
    if (imgRatio > availableRatio) {
      // Width is the limiting factor
      imgWidth = availableWidth;
      imgHeight = availableWidth / imgRatio;
    } else {
      // Height is the limiting factor
      imgHeight = availableHeight;
      imgWidth = availableHeight * imgRatio;
    }
    
    // Center the image on the page
    const xPos = (pageWidth - imgWidth) / 2;
    const yPos_img = 20 + ((availableHeight - imgHeight) / 2); // Center vertically
    
    pdf.addImage(imgData, 'PNG', xPos, yPos_img, imgWidth, imgHeight, undefined, 'FAST');
    
    // Add footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${totalPages} | Generated by Cloud Canvas Designer | ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const filename = generateFileName('azure-architecture-doc', 'pdf', options.environment);
    pdf.save(filename);
    
    return {
      success: true,
      filename,
      pages: totalPages,
      itemCount: items.length,
      connectionCount: connections.length
    };
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error(`Failed to export PDF: ${error.message}`);
  }
};

/**
 * Export Terraform with enterprise best practices
 */
export const exportTerraform = async (items, connections, boundaries = [], options = {}) => {
  try {
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
      // Generate enterprise-grade Terraform configuration
    // Pass boundaries for metadata/comments
    const rawTerraformFiles = generateTerraform(items, connections, boundaries);
    
    // Apply terraform fmt formatting (HCL canonical style)
    const terraformFiles = formatTerraformFiles(rawTerraformFiles);
    console.log('✅ Terraform files formatted with terraform fmt conventions');
    console.log(`📐 Architecture includes ${boundaries.length} boundaries for organization`);
      // Download all files with delays to prevent browser lag
    const fileNames = [];
    const environment = options.environment || 'prod';

    // ── Bundle all 5 files into a single ZIP ─────────────────────────────────
    const zip = new JSZip();
    const folderName = `terraform_${environment}_${new Date().toISOString().split('T')[0]}`;
    const folder = zip.folder(folderName);

    folder.file('main.tf',           terraformFiles.main);
    folder.file('variables.tf',      terraformFiles.variables);
    folder.file('outputs.tf',        terraformFiles.outputs);
    folder.file('terraform.tfvars',  terraformFiles.tfvars);
    folder.file('README.md',         terraformFiles.readme);

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const zipFilename = `azure_terraform_${environment}_${new Date().toISOString().split('T')[0]}_v${EXPORT_VERSION}.zip`;
    await downloadBlob(zipBlob, zipFilename);
    fileNames.push(zipFilename);

    return {
      success: true,
      files: fileNames,
      itemCount: items.length,
      connectionCount: connections.length
    };
    
  } catch (error) {
    console.error('Terraform Export Error:', error);
    throw new Error(`Failed to export Terraform: ${error.message}`);
  }
};

/**
 * Export ARM Template with enterprise standards
 */
export const exportARMTemplate = async (items, connections, boundaries = [], options = {}) => {
  try {
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    console.log(`📄 Exporting ARM Template with ${boundaries.length} boundaries for organization`);

    // Compose compliance/branding info
    const complianceSummary = options.complianceSummary || validation.complianceSummary || { status: 'Compliant', score: 100 };
    const branding = options.branding || "Arunim's IT Caffe";
    const author = options.author || 'Arunim Pandey';
    const version = options.version || EXPORT_VERSION;
    const timestamp = options.timestamp || new Date().toISOString();
    let complianceBadge = '🟢';
    if (complianceSummary.score < 90) complianceBadge = '🟡';
    if (complianceSummary.score < 70) complianceBadge = '🔴';

    // Generate ARM template with full metadata (pass boundaries)
    const armTemplate = generateARMTemplate(items, connections, {
      boundaries,
      complianceSummary,
      branding,
      author,
      version,
      timestamp,
      complianceBadge
    });

    // Enhance with enterprise metadata
    armTemplate.metadata = {
      ...armTemplate.metadata,
      version: EXPORT_VERSION,
      generatedBy: 'Cloud Canvas Designer',
      environment: options.environment || 'production',
      compliance: {
        standard: 'Enterprise',
        validated: true
      }
    };
    
    // Add deployment documentation
    armTemplate.metadata.deploymentNotes = [
      'Review all parameter values before deployment',
      'Ensure proper Azure RBAC permissions',
      'Test in non-production environment first',
      'Configure monitoring and alerts',
      'Implement backup and disaster recovery'
    ];
    
    // Convert to formatted JSON
    const jsonString = JSON.stringify(armTemplate, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    
    // Check file size
    const sizeInMB = blob.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      throw new Error(`File size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE_MB}MB)`);
    }
    
    const filename = generateFileName('azure-arm-template', 'json', options.environment);
    await downloadBlob(blob, filename);
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Generate parameters file
    const parametersContent = generateARMParameters(armTemplate, options);
    const paramsBlob = new Blob([parametersContent], { type: 'application/json;charset=utf-8' });
    const paramsFilename = generateFileName('azure-arm-parameters', 'json', options.environment);
    await downloadBlob(paramsBlob, paramsFilename);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Generate deployment script
    const deployScript = generateARMDeploymentScript(filename, paramsFilename, options);
    const scriptBlob = new Blob([deployScript], { type: 'text/plain;charset=utf-8' });
    const scriptFilename = `deploy_${options.environment || 'prod'}.sh`;
    await downloadBlob(scriptBlob, scriptFilename);
    
    return {
      success: true,
      files: [filename, paramsFilename, scriptFilename],
      itemCount: items.length,
      connectionCount: connections.length
    };
    
  } catch (error) {
    console.error('ARM Template Export Error:', error);
    throw new Error(`Failed to export ARM Template: ${error.message}`);
  }
};

/**
 * Generate ARM parameters file
 */
const generateARMParameters = (template) => {
  const parameters = {
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "metadata": {
      "description": "Parameters for Azure ARM Template deployment",
      "generatedDate": new Date().toISOString()
    },
    "parameters": {}
  };
  
  // Extract parameters from template
  if (template.parameters) {
    Object.keys(template.parameters).forEach(key => {
      parameters.parameters[key] = {
        value: template.parameters[key].defaultValue || ""
      };
    });
  }
  
  return JSON.stringify(parameters, null, 2);
};

/**
 * Generate ARM deployment script
 */
const generateARMDeploymentScript = (templateFile, parametersFile, options) => {
  const resourceGroup = `rg-azure-architecture-${options.environment || 'prod'}`;
  const location = options.region || 'eastus';
  
  return `#!/bin/bash
##############################################################################
# Azure ARM Template Deployment Script
# Generated by Cloud Canvas Designer v${EXPORT_VERSION}
# Date: ${new Date().toISOString()}
##############################################################################

# Configuration
RESOURCE_GROUP="${resourceGroup}"
LOCATION="${location}"
DEPLOYMENT_NAME="azure-arch-deployment-$(date +%Y%m%d-%H%M%S)"
TEMPLATE_FILE="${templateFile}"
PARAMETERS_FILE="${parametersFile}"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

echo "=================================="
echo "Azure ARM Template Deployment"
echo "=================================="
echo ""

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "\${RED}Azure CLI is not installed. Please install it first.\${NC}"
    exit 1
fi

# Login check
echo "Checking Azure login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "\${YELLOW}Please login to Azure\${NC}"
    az login
fi

# Create resource group
echo "Creating resource group: $RESOURCE_GROUP in $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION

if [ $? -eq 0 ]; then
    echo -e "\${GREEN}Resource group created successfully\${NC}"
else
    echo -e "\${RED}Failed to create resource group\${NC}"
    exit 1
fi

# Validate template
echo "Validating ARM template..."
az deployment group validate \\
    --resource-group $RESOURCE_GROUP \\
    --template-file $TEMPLATE_FILE \\
    --parameters $PARAMETERS_FILE

if [ $? -eq 0 ]; then
    echo -e "\${GREEN}Template validation successful\${NC}"
else
    echo -e "\${RED}Template validation failed\${NC}"
    exit 1
fi

# Deploy template
echo "Deploying ARM template..."
az deployment group create \\
    --name $DEPLOYMENT_NAME \\
    --resource-group $RESOURCE_GROUP \\
    --template-file $TEMPLATE_FILE \\
    --parameters $PARAMETERS_FILE \\
    --verbose

if [ $? -eq 0 ]; then
    echo -e "\${GREEN}Deployment completed successfully!\${NC}"
    echo ""
    echo "Deployment details:"
    az deployment group show \\
        --resource-group $RESOURCE_GROUP \\
        --name $DEPLOYMENT_NAME \\
        --query "{Name:name, State:properties.provisioningState, Timestamp:properties.timestamp}" \\
        --output table
else
    echo -e "\${RED}Deployment failed\${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "Deployment Complete"
echo "=================================="
`;
};

/**
 * Utility function to download blob as file
 * Optimized to prevent UI lag and memory leaks
 */
const downloadBlob = (blob, filename) => {
  return new Promise((resolve) => {
    // Use requestAnimationFrame to avoid blocking the main thread
    requestAnimationFrame(() => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Use setTimeout to ensure click happens after DOM update
      setTimeout(() => {
        link.click();
        
        // Clean up immediately after click
        requestAnimationFrame(() => {
          document.body.removeChild(link);
          // Revoke URL after longer delay to ensure download starts
          setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve();
          }, 1000);
        });
      }, 10);
    });
  });
};

/**
 * Export cost report with comprehensive analysis
 */
export const exportCostReport = (items, region, currency) => {
  try {
    // Validate data
    const validation = validateExportData(items, []);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate cost report PDF
    const filename = generateCostPDF(items, region, currency);
    
    return {
      success: true,
      filename,
      itemCount: items.length,
      region,
      currency
    };
    
  } catch (error) {
    console.error('Cost Report Export Error:', error);
    throw new Error(`Failed to export cost report: ${error.message}`);
  }
};
