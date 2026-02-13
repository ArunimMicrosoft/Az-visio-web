// Canvas Renderer for Exports
// This creates a standalone canvas with items and connections for export
// WITHOUT affecting the main application

/**
 * Render items and connections to a canvas element for export
 * This is a pure rendering function that doesn't use html2canvas
 */
export const renderDiagramToCanvas = async (items, connections, options = {}) => {
  const padding = options.padding || 50;
  const scale = options.scale || 2; // Higher scale for better quality
  
  console.log('🎨 Starting diagram render with', items.length, 'items and', connections.length, 'connections');
  
  // Calculate bounds
  if (items.length === 0) {
    throw new Error('No items to render');
  }
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  // Calculate bounds from items
  items.forEach(item => {
    const x = item.x || 0;
    const y = item.y || 0;
    const width = item.width || 80;
    const height = item.height || 80;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });
  
  // Also check connection endpoints
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
  
  console.log('📐 Diagram bounds:', { minX, minY, maxX, maxY, contentWidth, contentHeight });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = contentWidth * scale;
  canvas.height = contentHeight * scale;
  const ctx = canvas.getContext('2d');
  
  // Scale for high quality
  ctx.scale(scale, scale);
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, contentWidth, contentHeight);
  
  // Draw grid (optional)
  if (options.showGrid) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    
    for (let x = 0; x < contentWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, contentHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y < contentHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(contentWidth, y);
      ctx.stroke();
    }
  }
  
  // Draw connections first (behind items)
  connections.forEach(conn => {
    const startX = (conn.startX || 0) - minX;
    const startY = (conn.startY || 0) - minY;
    const endX = (conn.endX || 0) - minX;
    const endY = (conn.endY || 0) - minY;
    
    ctx.strokeStyle = conn.color || '#28a745';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrow
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = 15;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  });
  
  // Draw items
  const imagePromises = items.map(item => {
    return new Promise((resolve) => {
      const x = (item.x || 0) - minX;
      const y = (item.y || 0) - minY;
      const width = item.width || 80;
      const height = item.height || 80;
      
      // Draw item background
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0078D4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 8);
      ctx.fill();
      ctx.stroke();
      
      // Load and draw icon
      if (item.icon) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const iconSize = Math.min(width, height) * 0.5;
          const iconX = x + (width - iconSize) / 2;
          const iconY = y + 10;
          
          ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
          
          // Draw name
          ctx.fillStyle = '#333333';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.name || 'Unnamed', x + width / 2, y + height - 10);
          
          resolve();
        };
        
        img.onerror = () => {
          // Draw placeholder if icon fails
          ctx.fillStyle = '#0078D4';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('📦', x + width / 2, y + height / 2);
          
          // Draw name
          ctx.fillStyle = '#333333';
          ctx.font = '12px Arial';
          ctx.fillText(item.name || 'Unnamed', x + width / 2, y + height - 10);
          
          resolve();
        };
        
        // Try to load icon
        img.src = item.icon;
      } else {
        // No icon - just draw name
        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name || 'Unnamed', x + width / 2, y + height / 2);
        resolve();
      }
    });
  });
  
  // Wait for all images to load
  await Promise.all(imagePromises);
  
  console.log('✅ Diagram rendered successfully');
  
  return {
    canvas,
    bounds: { minX, minY, maxX, maxY, width: contentWidth, height: contentHeight }
  };
};
