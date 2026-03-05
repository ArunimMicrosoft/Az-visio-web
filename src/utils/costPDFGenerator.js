// Azure Cost Estimate PDF Generator
// Simple PDF generator for cost reports

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
    console.log('Starting PDF generation...');
    
    if (!items || items.length === 0) {
      throw new Error('No items to export');
    }    const costData = calculateCost(items, regionKey, currencyKey);
    const region = azureRegions[regionKey] || azureRegions['eastus'];
    const currency = currencies[currencyKey] || currencies['USD'];
    console.log('Cost data calculated:', costData);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let y = 20;

    // HEADER
    doc.setFillColor(0, 120, 212);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Azure Architecture Designer', margin, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Cost Estimation Report', margin, 30);
      doc.setFontSize(9);
    const reportDate = new Date().toLocaleDateString('en-US');
    const reportID = `COST-${Date.now().toString().slice(-8)}`;
    doc.text(`Date: ${reportDate}`, pageWidth - margin - 40, 20);
    doc.text(`ID: ${reportID}`, pageWidth - margin - 40, 27);
    doc.text(`Region: ${region.name}`, pageWidth - margin - 40, 34);
    doc.text(`Currency: ${currency.name}`, pageWidth - margin - 40, 41);
    
    y = 60;

    // COST SUMMARY
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Cost Summary', margin, y);
    y += 10;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, pageWidth - 2 * margin, 35);
      doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Cost:', margin + 10, y + 12);
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 120, 212);
    doc.text(formatCost(costData.totalMonthly, currencyKey), pageWidth - margin - 10, y + 12, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Yearly Cost:', margin + 10, y + 25);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCost(costData.totalYearly, currencyKey), pageWidth - margin - 10, y + 25, { align: 'right' });
    
    y += 45;

    // RESOURCES
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resource Breakdown', margin, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (costData.breakdown && costData.breakdown.length > 0) {
      costData.breakdown.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
          doc.text(`${index + 1}. ${item.name}`, margin + 5, y);
        doc.text(`${item.serviceType}`, margin + 80, y);
        doc.text(formatCost(item.cost, currencyKey), pageWidth - margin - 10, y, { align: 'right' });
        y += 6;
      });    }
    
    y += 10;

    // COST OPTIMIZATION TIPS
    const optimizations = getCostOptimizations(items);
    if (optimizations.length > 0) {
      // Check if we need a new page
      if (y > 200) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 120, 212);
      doc.text('💡 Cost Optimization Recommendations', margin, y);
      y += 3;

      // Thin blue line under header
      doc.setDrawColor(0, 120, 212);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 7;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);

      // Group by priority
      const highPriority = optimizations.filter(o => o.priority === 'high');
      const medPriority = optimizations.filter(o => o.priority === 'medium');
      const lowPriority = optimizations.filter(o => o.priority === 'low');

      const renderOptGroup = (title, opts, color) => {
        if (opts.length === 0) return;

        if (y > 265) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(title, margin + 2, y);
        y += 6;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);

        opts.forEach((opt, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          // Category + Service label
          const label = `${opt.category || ''} ${opt.service}`;
          doc.setFont('helvetica', 'bold');
          doc.text(`${idx + 1}. ${label}`, margin + 4, y);
          
          // Potential savings badge on the right
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(0, 120, 212);
          doc.text(`Savings: ${opt.potentialSavings}`, pageWidth - margin - 5, y, { align: 'right' });
          y += 5;

          // Recommendation text (wrap long text)
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const maxWidth = pageWidth - 2 * margin - 10;
          const splitText = doc.splitTextToSize(opt.suggestion, maxWidth);
          splitText.forEach(line => {
            if (y > 275) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin + 8, y);
            y += 4;
          });
          y += 2;
        });
        y += 3;
      };

      renderOptGroup('🔴 High Priority', highPriority, [220, 53, 69]);
      renderOptGroup('🟡 Medium Priority', medPriority, [255, 193, 7]);
      renderOptGroup('🟢 Low Priority', lowPriority, [40, 167, 69]);

      // Summary box
      if (y > 255) {
        doc.addPage();
        y = 20;
      }
      doc.setDrawColor(0, 120, 212);
      doc.setFillColor(240, 248, 255);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, pageWidth - 2 * margin, 14, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 90, 170);
      doc.text(`📋 ${optimizations.length} optimization tips identified (${highPriority.length} high, ${medPriority.length} medium, ${lowPriority.length} low priority)`, margin + 5, y + 6);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Run Azure Advisor in the Azure Portal for real-time, personalized recommendations.', margin + 5, y + 11);
      y += 20;
    }

    // TOTAL
    doc.setDrawColor(0, 120, 212);
    doc.setLineWidth(1);
    doc.rect(pageWidth - margin - 70, y, 70, 25);
      doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL MONTHLY:', pageWidth - margin - 65, y + 10);
    doc.setFontSize(14);
    doc.setTextColor(0, 120, 212);
    doc.text(formatCost(costData.totalMonthly, currencyKey), pageWidth - margin - 5, y + 10, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL YEARLY:', pageWidth - margin - 65, y + 18);
    doc.setFontSize(12);
    doc.text(formatCost(costData.totalYearly, currencyKey), pageWidth - margin - 5, y + 18, { align: 'right' });

    // FOOTER
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text(`Estimate based on Azure pricing (February 2026, ${region.name})`, margin, 280);
    doc.text(`Currency: ${currency.name} (${currency.symbol})`, margin, 285);
    doc.text('Generated by Azure Architecture Designer', margin, 290);

    // Save
    const fileName = `Azure-Cost-Estimate-${Date.now()}.pdf`;
    doc.save(fileName);
    console.log('PDF saved:', fileName);
    
    return fileName;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export default generateCostPDF;
