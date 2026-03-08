// Azure Cost Estimate PDF Generator
// Enterprise-grade PDF with no overlaps, professional formatting

import jsPDF from 'jspdf';
import { calculateCost, formatCost, azureRegions, currencies, getCostOptimizations } from './costCalculator';

/**
 * Generate and download a professional PDF cost report
 * @param {Array} items - Array of Azure service items on canvas
 * @param {string} regionKey - Azure region key (default: 'eastus')
 * @param {string} currencyKey - Currency code (default: 'USD')
 */
export const generateCostPDF = (items, regionKey = 'eastus', currencyKey = 'USD') => {
  try {
    console.log('🎨 Starting enterprise PDF generation...');
    
    if (!items || items.length === 0) {
      throw new Error('No items to export');
    }

    const costData = calculateCost(items, regionKey, currencyKey);
    const region = azureRegions[regionKey] || azureRegions['eastus'];
    const currency = currencies[currencyKey] || currencies['USD'];
    console.log('💰 Cost data calculated:', costData);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let currentY = margin;    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace) => {
      if (currentY + requiredSpace > pageHeight - margin - 20) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // ============================================================================
    // PAGE 1: COVER PAGE
    // ============================================================================
    
    // Header Bar
    doc.setFillColor(0, 120, 212); // Azure Blue
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text("Azure Cost Estimate Report", pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text("Enterprise Architecture Cost Analysis", pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("Arunim's IT Café — Azure Architecture Designer v1.0.0", pageWidth / 2, 52, { align: 'center' });
    
    currentY = 80;

    // Report Metadata Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'FD');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Details', margin + 10, currentY + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const reportID = `COST-${Date.now().toString().slice(-8)}`;
    
    doc.text(`Report ID:`, margin + 10, currentY + 22);
    doc.setFont('helvetica', 'bold');
    doc.text(reportID, margin + 40, currentY + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Date:`, margin + 10, currentY + 30);
    doc.setFont('helvetica', 'bold');
    doc.text(reportDate, margin + 40, currentY + 30);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Region:`, margin + 10, currentY + 38);
    doc.setFont('helvetica', 'bold');
    doc.text(region.name, margin + 40, currentY + 38);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Currency:`, margin + 100, currentY + 38);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currency.name} (${currency.symbol})`, margin + 130, currentY + 38);
    
    currentY += 65;

    // Cost Summary Box - Large and Prominent
    doc.setDrawColor(0, 120, 212);
    doc.setLineWidth(2);
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(margin, currentY, contentWidth, 70, 5, 5, 'FD');
    
    doc.setTextColor(0, 120, 212);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cost Summary', pageWidth / 2, currentY + 12, { align: 'center' });
    
    // Monthly Cost
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Estimate:', margin + 15, currentY + 30);
    
    doc.setTextColor(0, 120, 212);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCost(costData.totalMonthly, currencyKey), pageWidth - margin - 15, currentY + 32, { align: 'right' });
    
    // Yearly Cost
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Yearly Estimate:', margin + 15, currentY + 50);
    
    doc.setTextColor(0, 90, 170);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCost(costData.totalYearly, currencyKey), pageWidth - margin - 15, currentY + 52, { align: 'right' });
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin + 10, currentY + 40, pageWidth - margin - 10, currentY + 40);
    
    currentY += 85;

    // Architecture Overview
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Architecture Overview', margin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Resources: ${items.length}`, margin + 5, currentY);
    currentY += 8;
    
    const serviceTypes = [...new Set(items.map(i => i.serviceType))];
    doc.text(`Unique Service Types: ${serviceTypes.length}`, margin + 5, currentY);
    currentY += 8;
    
    doc.text(`Deployment Region: ${region.name}`, margin + 5, currentY);
    currentY += 15;

    // Important Notice Box
    doc.setDrawColor(255, 193, 7);
    doc.setFillColor(255, 248, 225);
    doc.setLineWidth(1);
    doc.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'FD');
    
    doc.setTextColor(180, 120, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️  Important Notice', margin + 10, currentY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 80, 0);    doc.text('This is an estimate only. Actual costs may vary based on usage, configuration,', margin + 10, currentY + 18);
    doc.text('and Azure pricing changes. Always verify with Azure Cost Calculator.', margin + 10, currentY + 23);
    
    currentY += 30;

    // ============================================================================
    // PAGE 2: RESOURCE BREAKDOWN
    // ============================================================================
    
    doc.addPage();
    currentY = margin;
    
    // Page Header
    doc.setFillColor(0, 120, 212);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Resource Cost Breakdown', pageWidth / 2, 20, { align: 'center' });
    
    currentY = 50;

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, contentWidth, 10, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('#', margin + 3, currentY + 7);
    doc.text('Resource Name', margin + 10, currentY + 7);
    doc.text('Service Type', margin + 80, currentY + 7);
    doc.text('Monthly Cost', pageWidth - margin - 30, currentY + 7, { align: 'right' });
    
    currentY += 10;

    // Table Rows
    if (costData.breakdown && costData.breakdown.length > 0) {
      costData.breakdown.forEach((item, index) => {
        checkPageBreak(10);
        
        // Alternate row colors for readability
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, currentY, contentWidth, 8, 'F');
        }
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Index
        doc.text(`${index + 1}`, margin + 3, currentY + 6);
        
        // Resource Name (truncate if too long)
        const maxNameWidth = 65;
        let resourceName = item.name || 'Unnamed Resource';
        if (doc.getTextWidth(resourceName) > maxNameWidth) {
          while (doc.getTextWidth(resourceName + '...') > maxNameWidth && resourceName.length > 0) {
            resourceName = resourceName.slice(0, -1);
          }
          resourceName += '...';
        }
        doc.text(resourceName, margin + 10, currentY + 6);
        
        // Service Type
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80, 80, 80);
        doc.text(item.serviceType || 'Unknown', margin + 80, currentY + 6);
        
        // Cost
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 120, 212);
        doc.text(formatCost(item.cost, currencyKey), pageWidth - margin - 5, currentY + 6, { align: 'right' });
        
        currentY += 8;
      });
    } else {
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'italic');
      doc.text('No resources found', margin + 10, currentY + 10);
      currentY += 15;
    }
    
    currentY += 5;

    // Total Bar
    checkPageBreak(15);
    doc.setFillColor(0, 120, 212);
    doc.rect(margin, currentY, contentWidth, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL MONTHLY COST:', margin + 10, currentY + 8);
    doc.setFontSize(13);
    doc.text(formatCost(costData.totalMonthly, currencyKey), pageWidth - margin - 10, currentY + 8, { align: 'right' });
    
    currentY += 20;

    // ============================================================================
    // PAGE 3+: COST OPTIMIZATION RECOMMENDATIONS
    // ============================================================================
    
    const optimizations = getCostOptimizations(items);
    if (optimizations.length > 0) {
      doc.addPage();
      currentY = margin;
      
      // Page Header
      doc.setFillColor(0, 120, 212);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Cost Optimization Recommendations', pageWidth / 2, 20, { align: 'center' });
      
      currentY = 50;

      // Introduction
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('The following recommendations can help reduce your Azure costs while maintaining performance and reliability:', margin, currentY);
      currentY += 15;

      // Group by priority
      const highPriority = optimizations.filter(o => o.priority === 'high');
      const medPriority = optimizations.filter(o => o.priority === 'medium');
      const lowPriority = optimizations.filter(o => o.priority === 'low');

      const renderOptGroup = (title, opts, color, icon) => {
        if (opts.length === 0) return;

        checkPageBreak(20);

        // Section Header
        doc.setFillColor(color[0], color[1], color[2], 0.1);
        doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
        
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${icon} ${title} (${opts.length})`, margin + 5, currentY + 7);
        
        currentY += 15;

        opts.forEach((opt, idx) => {
          checkPageBreak(25);

          // Recommendation Box
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.5);
          doc.roundedRect(margin + 3, currentY, contentWidth - 6, 20, 2, 2, 'S');
          
          // Number badge
          doc.setFillColor(color[0], color[1], color[2]);
          doc.circle(margin + 10, currentY + 6, 3, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`${idx + 1}`, margin + 10, currentY + 7.5, { align: 'center' });
          
          // Service/Category
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const label = opt.category ? `${opt.category} — ${opt.service}` : opt.service;
          doc.text(label, margin + 16, currentY + 7);
          
          // Potential Savings
          doc.setTextColor(color[0], color[1], color[2]);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(opt.potentialSavings, pageWidth - margin - 8, currentY + 7, { align: 'right' });
          
          // Suggestion text (with wrapping)
          doc.setTextColor(60, 60, 60);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const maxWidth = contentWidth - 25;
          const splitText = doc.splitTextToSize(opt.suggestion, maxWidth);
          let textY = currentY + 13;
          splitText.slice(0, 2).forEach(line => { // Max 2 lines
            doc.text(line, margin + 16, textY);
            textY += 4;
          });
          
          currentY += 25;
        });
        
        currentY += 5;
      };

      renderOptGroup('High Priority', highPriority, [220, 53, 69], '🔴');
      renderOptGroup('Medium Priority', medPriority, [255, 193, 7], '🟡');
      renderOptGroup('Low Priority', lowPriority, [40, 167, 69], '🟢');

      // Summary Box
      checkPageBreak(25);
      doc.setDrawColor(0, 120, 212);
      doc.setFillColor(240, 248, 255);
      doc.setLineWidth(1);
      doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'FD');
      
      doc.setTextColor(0, 90, 170);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('📋 Summary', margin + 10, currentY + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total: ${optimizations.length} recommendations (${highPriority.length} high, ${medPriority.length} medium, ${lowPriority.length} low priority)`, margin + 10, currentY + 15);
    }

    // ============================================================================
    // FINAL PAGE: COMPLIANCE & FOOTER
    // ============================================================================
    
    doc.addPage();
    currentY = margin;
    
    // Page Header
    doc.setFillColor(0, 120, 212);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance & Disclaimer', pageWidth / 2, 20, { align: 'center' });
    
    currentY = 50;

    // Compliance Badge
    let complianceScore = costData.complianceScore || 100;
    let badge = '';
    let badgeColor = [0, 0, 0];
    
    if (complianceScore >= 90) {
      badge = '🟢 Compliant';
      badgeColor = [40, 167, 69];
    } else if (complianceScore >= 70) {
      badge = '🟡 Partial Compliance';
      badgeColor = [255, 193, 7];
    } else {
      badge = '🔴 Non-Compliant';
      badgeColor = [220, 53, 69];
    }
    
    doc.setDrawColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2], 0.1);
    doc.setLineWidth(2);
    doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'FD');
    
    doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Status:', margin + 10, currentY + 8);
    doc.setFontSize(16);
    doc.text(badge, margin + 10, currentY + 16);
    
    currentY += 30;

    // Disclaimer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Disclaimer', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const disclaimerText = [
      '• This cost estimate is based on Azure list prices as of February 2026 and may not reflect actual costs.',
      '• Actual costs depend on usage patterns, data transfer, storage consumption, and other variables.',
      '• Enterprise agreements, reserved instances, and Azure Hybrid Benefit can significantly reduce costs.',
      '• Always use the official Azure Pricing Calculator for production cost planning.',
      '• Costs are subject to change without notice. Verify current pricing before deployment.',
      '• This report is generated for informational purposes only and does not constitute financial advice.'
    ];
    
    disclaimerText.forEach(text => {
      const wrapped = doc.splitTextToSize(text, contentWidth - 10);
      wrapped.forEach(line => {
        checkPageBreak(6);
        doc.text(line, margin + 5, currentY);
        currentY += 5;
      });
    });
      currentY += 10;

    // Next Steps
    doc.setTextColor(0, 120, 212);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Steps', margin, currentY);
    currentY += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const nextSteps = [
      '1. Review the cost breakdown and identify optimization opportunities',
      '2. Use Azure Cost Management + Billing for real-time cost tracking',
      '3. Implement cost alerts and budgets in the Azure Portal',
      '4. Consider reserved instances for predictable workloads (up to 72% savings)',
      '5. Enable Azure Advisor for personalized recommendations',
      '6. Validate architecture with Azure Well-Architected Framework'
    ];
    
    nextSteps.forEach(step => {
      checkPageBreak(6);
      doc.text(step, margin + 5, currentY);
      currentY += 6;
    });
    
    currentY += 10;

    // ============================================================================
    // ADD PAGE NUMBERS AND FOOTERS TO ALL PAGES
    // ============================================================================
      const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Footer branding on all pages
      doc.setFontSize(7);
      doc.text(`© Arunim's IT Café | Azure Architecture Designer v1.0.0 | ${reportDate}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // Save
    const fileName = `Azure-Cost-Estimate-${reportID}.pdf`;
    doc.save(fileName);
    console.log('✅ Industry-grade PDF saved:', fileName);
    
    return fileName;
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
};

export default generateCostPDF;

