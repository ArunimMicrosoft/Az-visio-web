// filepath: c:\Users\labadmin\Desktop\python-mini\Az visio web\src\utils\canvasRenderer.js
// Canvas Renderer for Exports
// This creates a standalone canvas with items and connections for export
// WITHOUT affecting the main application

/**
 * Render items, connections, and boundaries to a canvas element for export
 * This is a pure rendering function that doesn't use html2canvas
 * Enterprise-standard: Includes all architectural elements (boundaries, items, connections)
 */
export const renderDiagramToCanvas = async (items, connections, boundaries = [], options = {}) => {
  const padding = options.padding || 50;
  // Increase scale for better resolution (default 3x)
  const scale = options.scale || 3; 
  
  console.log('🎨 Starting diagram render with', items.length, 'items,', connections.length, 'connections, and', boundaries.length, 'boundaries');
  
  // Calculate bounds
  if (items.length === 0 && boundaries.length === 0) {
    throw new Error('No items or boundaries to render');
  }
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  // Calculate bounds from items with their dimensions
  // Default item size in Canvas-new.jsx is 80x80
  const ITEM_WIDTH = 80;
  const ITEM_HEIGHT = 80;

  items.forEach(item => {
    const x = item.x || 0;
    const y = item.y || 0;
    const width = item.width || ITEM_WIDTH;
    const height = item.height || ITEM_HEIGHT;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });
  
  // Also include boundaries in bounds calculation
  boundaries.forEach(boundary => {
    if (boundary.x !== undefined && boundary.y !== undefined) {
      minX = Math.min(minX, boundary.x);
      minY = Math.min(minY, boundary.y);
      maxX = Math.max(maxX, boundary.x + (boundary.width || 0));
      maxY = Math.max(maxY, boundary.y + (boundary.height || 0));
    }
  });
  
  // Also check connection endpoints (if using drag format)
  connections.forEach(conn => {
    if (conn.startX !== undefined) minX = Math.min(minX, conn.startX);
    if (conn.startY !== undefined) minY = Math.min(minY, conn.startY);
    if (conn.endX !== undefined) maxX = Math.max(maxX, conn.endX);
    if (conn.endY !== undefined) maxY = Math.max(maxY, conn.endY);
  });
  
  // Add padding
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  
  // Add header and footer height
  const HEADER_HEIGHT = 60;
  const FOOTER_HEIGHT = 40;
  
  const totalHeight = contentHeight + HEADER_HEIGHT + FOOTER_HEIGHT; // Include branding space
  
  console.log('📐 Diagram bounds:', { minX, minY, maxX, maxY, contentWidth, contentHeight });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = contentWidth * scale;
  canvas.height = totalHeight * scale; // Include header/footer
  const ctx = canvas.getContext('2d');
  
  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Scale everything
  ctx.scale(scale, scale);
  
  // 1. Draw Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, contentWidth, totalHeight);
  
  // 2. Draw Header Background
  const gradient = ctx.createLinearGradient(0, 0, contentWidth, 0);
  gradient.addColorStop(0, '#0078D4');
  gradient.addColorStop(1, '#005a9e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, contentWidth, HEADER_HEIGHT);
  
  // 3. Draw App Branding in Header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText("Arunim's IT Caffe — Azure Architecture Designer", 20, HEADER_HEIGHT / 2);

  // Draw environment/context info
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  const environment = options.environment || 'Production';
  const dateStr = new Date().toLocaleDateString();
  ctx.fillText(`${environment} | v2.1.0 | ${dateStr}`, contentWidth - 20, HEADER_HEIGHT / 2);
  
  // Offset for diagram content (push down by header height)
  const contentOffsetY = HEADER_HEIGHT;
  
  // 4. Draw grid (optional)
  if (options.showGrid !== false) {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    // Draw grid only in content area
    ctx.beginPath();
    for (let x = 0; x < contentWidth; x += gridSize) {
      ctx.moveTo(x, contentOffsetY);
      ctx.lineTo(x, contentOffsetY + contentHeight);
    }
    for (let y = 0; y < contentHeight; y += gridSize) {
      ctx.moveTo(0, contentOffsetY + y);
      ctx.lineTo(contentWidth, contentOffsetY + y);
    }
    ctx.stroke();
  }
  
  // 4.5 Draw Boundaries (ENTERPRISE STANDARD - RENDER FIRST, UNDERNEATH ITEMS)
  boundaries.forEach(boundary => {
    const x = (boundary.x || 0) - minX;
    const y = (boundary.y || 0) - minY + contentOffsetY;
    const width = boundary.width || 200;
    const height = boundary.height || 150;
    
    // Boundary color mapping (matches UI)
    const boundaryColors = {
      'resource-group': '#0078D4',
      'subscription': '#5C2D91',
      'virtual-network': '#008272',
      'subnet': '#00BCF2',
      'region': '#FF6C37',
      'availability-zone': '#FFB900',
      'availability-set': '#50E6FF',
      'security-boundary': '#E81123',
      'nsg-boundary': '#FF8C00',
      'application': '#107C10',
    };
    
    const boundaryType = boundary.type || 'resource-group';
    const borderColor = boundaryColors[boundaryType] || '#0078D4';
    const bgColor = borderColor + '15'; // 15 = 8% opacity in hex
    
    // Draw boundary background
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);
    
    // Draw boundary border with style
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    
    // Apply line style (solid, dashed, dotted)
    if (boundary.style === 'dashed' || boundaryType === 'subnet') {
      ctx.setLineDash([10, 5]);
    } else if (boundary.style === 'dotted') {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]); // Reset
    
    // Draw boundary label/header
    const labelHeight = 30;
    ctx.fillStyle = borderColor + '40'; // 40 = 25% opacity
    ctx.fillRect(x, y, width, labelHeight);
    
    // Draw boundary icon and label text
    ctx.fillStyle = borderColor;
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const icon = boundary.icon || '📦';
    const label = boundary.label || boundaryType;
    ctx.fillText(`${icon} ${label}`, x + 10, y + labelHeight / 2);
  });
  
  console.log(`✅ Rendered ${boundaries.length} boundaries`);
  
  // Helper to map item ID to coordinates (center point)
  const getItemCenter = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return null;
    return {
      x: (item.x - minX) + (item.width || ITEM_WIDTH) / 2,
      y: (item.y - minY) + (item.height || ITEM_HEIGHT) / 2 + contentOffsetY
    };
  };

  // 5. Draw Connections
  connections.forEach(conn => {
    // If connection has explicit coordinates (drag line), use them
    // Otherwise calculate from item IDs 
    let start, end;
    
    if (conn.from && conn.to) {
      start = getItemCenter(conn.from);
      end = getItemCenter(conn.to);
    }
    
    // Fallback to coordinates if available (legacy/drag)
    if ((!start || !end) && conn.startX !== undefined) {
       start = { x: (conn.startX - minX), y: (conn.startY - minY) + contentOffsetY };
       end = { x: (conn.endX - minX), y: (conn.endY - minY) + contentOffsetY };
    }
    
    if (!start || !end) return;
    
    // Determine color based on status
    let color = '#0078D4'; // Default blue
    if (conn.status === 'valid') color = '#107C10'; // Green
    if (conn.status === 'warning') color = '#FFB900'; // Yellow
    if (conn.status === 'invalid') color = '#D83B01'; // Red
    
    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    // Draw connection points (circles) at ends
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Start point
    ctx.beginPath();
    ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // End point
    ctx.beginPath();
    ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  // 6. Draw Items
  const imagePromises = items.map(item => {
    return new Promise((resolve, reject) => {
      const x = (item.x || 0) - minX;
      const y = (item.y || 0) - minY + contentOffsetY; // Add header offset
      const width = item.width || ITEM_WIDTH;
      const height = item.height || ITEM_HEIGHT;
      
      // Draw item shadow
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      // Draw item background
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0078D4'; // Azure Blue border
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      // Use roundRect if available, otherwise rect
      if (ctx.roundRect) {
          ctx.roundRect(x, y, width, height, 8);
      } else {
          ctx.rect(x, y, width, height);
      }
      ctx.fill();
      
      // Remove shadow for border and internal elements
      ctx.shadowColor = 'transparent';
      ctx.stroke();
      
      // Helper function to draw label
      const drawLabel = (name) => {
          ctx.fillStyle = '#333333';
          ctx.font = '11px "Segoe UI", Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          // Simple text wrapping
          const maxWidth = width - 10;
          const textX = x + width / 2;
          const textY = y + 55; // Below icon area
          
          const words = (name || 'Unnamed').split(' ');
          let line = '';
          let lineCount = 0;
          let currentY = textY;
          
          for(let n = 0; n < words.length; n++) {
            // Limit to 2 lines max
            if (lineCount >= 2) {
                if (line.length > 0) ctx.fillText(line + '...', textX, currentY);
                return;
            }
            
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, textX, currentY);
                line = words[n] + ' ';
                currentY += 14;
                lineCount++;
            } else {
                line = testLine;
            }
          }
          ctx.fillText(line, textX, currentY);
      };

      // Load and draw icon
      // KEY FIX: Check 'path' property first (used in Terraform/App), then 'icon' (legacy)
      const iconPath = item.path || item.icon;
      
      if (iconPath) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Important for CORS
        
        img.onload = () => {
          try {
            // Calculate icon position (centered, top half)
            const iconSize = 40; // Fixed sensible size
            const iconX = x + (width - iconSize) / 2;
            const iconY = y + 10;
            
            ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
            
            // Draw text
            drawLabel(item.name);
            resolve();
          } catch (e) {
            console.error('Error drawing loaded image:', e);
            drawLabel(item.name); // Still draw label even if image fails
            resolve();
          }
        };
        
        img.onerror = (e) => {
          console.warn('Failed to load icon: ' + iconPath);
          // Fallback: draw placeholder box if icon fails
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(x + width/2 - 15, y + 15, 30, 30);
          
          ctx.fillStyle = '#666666';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('?', x + width / 2, y + 35); 
          
          drawLabel(item.name);
          resolve(); 
        };
        
        // Load image
        img.src = iconPath;
      } else {
        // No icon path - just draw text
        drawLabel(item.name);
        resolve();
      }
    });
  });
  
  // 7. Footer
  const footerY = totalHeight - FOOTER_HEIGHT; // Bottom area
  
  // Footer divider line
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(contentWidth, footerY);
  ctx.stroke();
  
  // Footer text with compliance badge and metadata
  ctx.fillStyle = '#666666';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const footerCenterY = footerY + (FOOTER_HEIGHT / 2);
  let complianceText = 'Compliant';
  if (options.validationSummary && options.validationSummary.score < 90) complianceText = 'Partial Compliance';
  if (options.validationSummary && options.validationSummary.score < 70) complianceText = 'Non-Compliant';
  ctx.fillText(`Generated by Arunim's IT Caffe | Compliance: ${complianceText} | v2.1.0 | ${options.author || 'Arunim Pandey'} | ${options.timestamp ? new Date(options.timestamp).toLocaleString() : ''}`, contentWidth / 2, footerCenterY);
  
  // Wait for all images
  try {
    await Promise.all(imagePromises);
  } catch (err) {
    console.warn('Reference error in image loading (non-fatal):', err);
  }
  
  console.log('✅ Diagram rendered with branding');
  
  return {
    canvas,
    bounds: { 
      minX, minY, maxX, maxY, 
      width: contentWidth, 
      height: totalHeight // Return full height including branding
    }
  };
};
