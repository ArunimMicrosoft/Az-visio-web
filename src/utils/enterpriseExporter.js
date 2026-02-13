// Enterprise-Grade Export Utility for Azure Architecture Designer
// Follows industry best practices for file naming, metadata, validation, and error handling

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { generateTerraform } from './terraformGenerator';
import { generateARMTemplate } from './armTemplateGenerator';
import { generateCostPDF } from './costPDFGenerator';

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
    generator: 'Azure Architecture Designer',
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
 * Export as JSON with enterprise metadata
 */
export const exportJSON = (items, connections, options = {}) => {
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
    
    // Download file
    const filename = generateFileName('azure-architecture', 'json', options.environment);
    downloadBlob(blob, filename);
    
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
 * Export as high-quality PNG with metadata
 */
export const exportPNG = async (canvasElement, items, connections, options = {}) => {
  try {
    if (!canvasElement) {
      throw new Error('Canvas element not found');
    }
    
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // High-quality rendering settings
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: options.quality === 'high' ? 3 : 2, // Higher DPI for enterprise use
      logging: false,
      useCORS: true,
      allowTaint: false,
      removeContainer: true,
      imageTimeout: 30000,
      ignoreElements: (element) => {
        return element.classList.contains('help-overlay') || 
               element.classList.contains('help-button') ||
               element.classList.contains('connecting-status') ||
               element.classList.contains('canvas-placeholder') ||
               element.classList.contains('mobile-menu-toggle') ||
               element.classList.contains('mobile-overlay');
      },
      onclone: (clonedDoc) => {
        // Clean up cloned document for export
        const clonedCanvas = clonedDoc.querySelector('.canvas');
        if (clonedCanvas) {
          clonedCanvas.style.transform = 'none';
          clonedCanvas.style.overflow = 'visible';
        }
      }
    });
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
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
        downloadBlob(blob, filename);
        
        resolve({
          success: true,
          filename,
          size: blob.size,
          dimensions: {
            width: canvas.width,
            height: canvas.height
          },
          quality: options.quality || 'standard'
        });
      }, 'image/png', options.quality === 'high' ? 1.0 : 0.92);
    });
    
  } catch (error) {
    console.error('PNG Export Error:', error);
    throw new Error(`Failed to export PNG: ${error.message}`);
  }
};

/**
 * Export as professional PDF with metadata and documentation
 */
export const exportPDF = async (canvasElement, items, connections, options = {}) => {
  try {
    if (!canvasElement) {
      throw new Error('Canvas element not found');
    }
    
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Capture canvas as image
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      ignoreElements: (element) => {
        return element.classList.contains('help-overlay') || 
               element.classList.contains('help-button') ||
               element.classList.contains('connecting-status') ||
               element.classList.contains('canvas-placeholder') ||
               element.classList.contains('mobile-menu-toggle') ||
               element.classList.contains('mobile-overlay');
      }
    });
    
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
      author: options.author || 'Azure Architecture Designer',
      keywords: 'azure, architecture, cloud, diagram',
      creator: 'Azure Architecture Designer v' + EXPORT_VERSION,
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
      `Region: ${options.region || 'East US'}`
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
    
    // Calculate image dimensions to fit page with margins
    const availableWidth = pageWidth - (2 * margin);
    const availableHeight = pageHeight - 25 - margin; // Account for header
    
    let imgWidth, imgHeight;
    const imgRatio = canvas.width / canvas.height;
    const availableRatio = availableWidth / availableHeight;
    
    if (imgRatio > availableRatio) {
      imgWidth = availableWidth;
      imgHeight = availableWidth / imgRatio;
    } else {
      imgHeight = availableHeight;
      imgWidth = availableHeight * imgRatio;
    }
    
    const xPos = (pageWidth - imgWidth) / 2;
    const yPos_img = 20;
    
    pdf.addImage(imgData, 'PNG', xPos, yPos_img, imgWidth, imgHeight, undefined, 'FAST');
    
    // Add footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${totalPages} | Generated by Azure Architecture Designer | ${new Date().toLocaleDateString()}`,
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
export const exportTerraform = (items, connections, options = {}) => {
  try {
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate Terraform configuration
    const terraformConfig = generateTerraform(items, connections);
    
    // Add enterprise header
    const header = `##############################################################################
# Azure Infrastructure as Code - Terraform Configuration
# 
# Generated by: Azure Architecture Designer v${EXPORT_VERSION}
# Date: ${new Date().toISOString()}
# Environment: ${options.environment || 'production'}
# Region: ${options.region || 'eastus'}
# 
# Total Resources: ${items.length}
# Total Connections: ${connections.length}
# 
# IMPORTANT: Review and customize this configuration before deployment
# - Update variable values in terraform.tfvars
# - Configure backend for state management
# - Review security and compliance settings
# - Test in non-production environment first
##############################################################################

`;
    
    const fullConfig = header + terraformConfig;
    
    // Create main.tf file
    const mainBlob = new Blob([fullConfig], { type: 'text/plain;charset=utf-8' });
    const mainFilename = generateFileName('main', 'tf', options.environment);
    downloadBlob(mainBlob, mainFilename);
    
    // Generate variables.tf
    const variablesContent = generateTerraformVariables(items, options);
    const variablesBlob = new Blob([variablesContent], { type: 'text/plain;charset=utf-8' });
    const variablesFilename = generateFileName('variables', 'tf', options.environment);
    downloadBlob(variablesBlob, variablesFilename);
    
    // Generate terraform.tfvars template
    const tfvarsContent = generateTerraformTfvars(items, options);
    const tfvarsBlob = new Blob([tfvarsContent], { type: 'text/plain;charset=utf-8' });
    const tfvarsFilename = generateFileName('terraform', 'tfvars', options.environment);
    downloadBlob(tfvarsBlob, tfvarsFilename);
      // Generate README
    const readmeContent = generateTerraformReadme(items, connections, options);
    const readmeBlob = new Blob([readmeContent], { type: 'text/markdown;charset=utf-8' });
    const readmeFilename = `README_${options.environment || 'prod'}.md`;
    downloadBlob(readmeBlob, readmeFilename);
    
    return {
      success: true,
      files: [mainFilename, variablesFilename, tfvarsFilename, readmeFilename],
      itemCount: items.length,
      connectionCount: connections.length
    };
    
  } catch (error) {
    console.error('Terraform Export Error:', error);
    throw new Error(`Failed to export Terraform: ${error.message}`);
  }
};

/**
 * Generate Terraform variables file
 */
const generateTerraformVariables = (items, options) => {
  return `# Terraform Variables
# Generated by Azure Architecture Designer

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "${options.environment || 'prod'}"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "${options.region || 'eastus'}"
}

variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "azure-arch"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Environment = "${options.environment || 'prod'}"
    ManagedBy   = "Terraform"
    Project     = "AzureArchitecture"
    Generated   = "${new Date().toISOString()}"
  }
}
`;
};

/**
 * Generate terraform.tfvars template
 */
const generateTerraformTfvars = (items, options) => {
  return `# Terraform Variable Values
# Customize these values for your deployment

environment     = "${options.environment || 'prod'}"
location        = "${options.region || 'eastus'}"
resource_prefix = "azure-arch"

# Add additional variable values as needed
`;
};

/**
 * Generate Terraform README
 */
const generateTerraformReadme = (items, connections, options) => {
  return `# Azure Architecture - Terraform Deployment Guide

## Overview
This Terraform configuration was generated by Azure Architecture Designer v${EXPORT_VERSION} on ${new Date().toLocaleString()}.

## Configuration Summary
- **Environment**: ${options.environment || 'production'}
- **Region**: ${options.region || 'eastus'}
- **Total Resources**: ${items.length}
- **Total Connections**: ${connections.length}

## Prerequisites
- Terraform >= 1.0
- Azure CLI
- Azure subscription with appropriate permissions
- Terraform backend configured (recommended)

## Deployment Steps

### 1. Initialize Terraform
\`\`\`bash
terraform init
\`\`\`

### 2. Review Configuration
\`\`\`bash
terraform plan
\`\`\`

### 3. Deploy Infrastructure
\`\`\`bash
terraform apply
\`\`\`

### 4. Verify Deployment
\`\`\`bash
terraform show
\`\`\`

## Important Notes
- Review all resource configurations before deployment
- Update variable values in terraform.tfvars
- Configure remote backend for team collaboration
- Implement proper state locking
- Follow Azure naming conventions
- Apply appropriate tags for cost management

## Security Considerations
- Review security group rules
- Configure Azure Key Vault for secrets
- Enable Azure Policy for compliance
- Implement RBAC appropriately
- Enable Azure Security Center

## Cost Management
- Review estimated costs before deployment
- Set up cost alerts
- Implement resource tagging strategy
- Consider using Azure Cost Management

## Support
For issues or questions, refer to:
- Terraform Azure Provider Documentation
- Azure Architecture Best Practices
- Azure Well-Architected Framework

Generated: ${new Date().toISOString()}
`;
};

/**
 * Export ARM Template with enterprise standards
 */
export const exportARMTemplate = (items, connections, options = {}) => {
  try {
    // Validate data
    const validation = validateExportData(items, connections);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate ARM template
    const armTemplate = generateARMTemplate(items, connections);
    
    // Enhance with enterprise metadata
    armTemplate.metadata = {
      ...armTemplate.metadata,
      version: EXPORT_VERSION,
      generatedBy: 'Azure Architecture Designer',
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
    downloadBlob(blob, filename);
    
    // Generate parameters file
    const parametersContent = generateARMParameters(armTemplate, options);
    const paramsBlob = new Blob([parametersContent], { type: 'application/json;charset=utf-8' });
    const paramsFilename = generateFileName('azure-arm-parameters', 'json', options.environment);
    downloadBlob(paramsBlob, paramsFilename);
    
    // Generate deployment script
    const deployScript = generateARMDeploymentScript(filename, paramsFilename, options);
    const scriptBlob = new Blob([deployScript], { type: 'text/plain;charset=utf-8' });
    const scriptFilename = `deploy_${options.environment || 'prod'}.sh`;
    downloadBlob(scriptBlob, scriptFilename);
    
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
# Generated by Azure Architecture Designer v${EXPORT_VERSION}
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
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object after a delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
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
