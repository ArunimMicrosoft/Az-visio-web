# Mobile Touch Support Guide

## Overview
Azure Architecture Designer now supports full mobile touch interactions, allowing users to design architecture diagrams on smartphones and tablets with the same ease as desktop devices.

## Features

### 📱 Touch Drag-and-Drop

#### From Toolbar to Canvas
1. **Long Press (200ms)**: Press and hold an Azure service icon in the toolbar
2. **Haptic Feedback**: Device vibrates to confirm drag start
3. **Visual Clone**: A semi-transparent clone appears following your finger
4. **Drag**: Move your finger to the desired location on canvas
5. **Drop**: Release to place the service on the canvas

#### Moving Items on Canvas
1. **Tap and Hold**: Touch an item on the canvas
2. **Drag**: Move your finger while keeping contact
3. **Drop**: Release to place the item at the new position

### 🎯 Touch Interaction Details

#### Long Press Timer
- **Duration**: 200ms (industry standard)
- **Tolerance**: 10px movement during long press
- **Feedback**: Haptic vibration (if device supports)

#### Visual Feedback
- **Drag Clone**: 
  - Azure blue border (dashed)
  - 80% opacity
  - Slight scale increase (1.1x)
  - Box shadow for depth
  - Follows finger precisely

- **Canvas Items**:
  - Scale animation on touch (1.05x)
  - Enhanced shadow during drag
  - Smooth transitions

#### Prevent Scrolling
- `touch-action: none` prevents page scroll during drag
- `e.preventDefault()` in touch handlers
- Maintains smooth dragging experience

### 🎨 CSS Optimizations

#### Touch-Friendly Targets
```css
/* Minimum 44x44px touch targets (WCAG AAA) */
.azure-icon {
  min-height: 65px; /* Mobile */
  touch-action: none;
  user-select: none;
}

.canvas-item {
  touch-action: none;
  -webkit-touch-callout: none;
}
```

#### Media Query Detection
```css
@media (hover: none) and (pointer: coarse) {
  /* Touch device specific styles */
  .azure-icon:active {
    background-color: rgba(0, 120, 212, 0.1);
  }
}
```

## Technical Implementation

### AzureIcon.jsx
```javascript
// Long press detection
const handleTouchStart = (e) => {
  const touch = e.touches[0];
  touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  
  longPressTimer.current = setTimeout(() => {
    setIsDragging(true);
    if (navigator.vibrate) {
      navigator.vibrate(50); // Haptic feedback
    }
    createDragClone(touch.clientX, touch.clientY);
  }, 200);
};

// Create visual clone
const createDragClone = (x, y) => {
  const clone = document.createElement('div');
  clone.className = 'azure-icon-clone';
  // ... styling and positioning
  document.body.appendChild(clone);
  dragClone.current = clone;
};

// Track finger movement
const handleTouchMove = (e) => {
  if (!isDragging) return;
  e.preventDefault(); // Prevent scrolling
  const touch = e.touches[0];
  
  // Update clone position
  dragClone.current.style.left = `${touch.clientX - 40}px`;
  dragClone.current.style.top = `${touch.clientY - 40}px`;
  
  // Dispatch event for canvas
  document.dispatchEvent(new CustomEvent('iconTouchDrop', {
    detail: { icon, clientX: touch.clientX, clientY: touch.clientY }
  }));
};
```

### Canvas-new.jsx
```javascript
// Listen for touch drop events
useEffect(() => {
  const handleIconTouchDrop = (e) => {
    const { icon, clientX, clientY } = e.detail;
    const rect = activeCanvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // Check bounds
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        const newItem = {
          id: Date.now(),
          serviceType: icon.id,
          name: icon.name,
          path: icon.path,
          x: x - 40,
          y: y - 40,
        };
        
        setItems(prevItems => [...prevItems, newItem]);
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    }
  };
  
  document.addEventListener('iconTouchDrop', handleIconTouchDrop);
  return () => document.removeEventListener('iconTouchDrop', handleIconTouchDrop);
}, [setItems, activeCanvasRef]);
```

## Browser Support

### Tested Devices
- ✅ iOS Safari (iPhone, iPad)
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ Samsung Internet
- ✅ Desktop browsers (fallback to mouse)

### Features Used
- `TouchEvent` API
- `navigator.vibrate()` (optional)
- `touch-action` CSS property
- `CustomEvent` for cross-component communication

## Performance Optimizations

1. **Event Throttling**: Touch move events processed efficiently
2. **Clone Cleanup**: Automatic removal of visual clones
3. **Memory Management**: Event listeners properly cleaned up
4. **Smooth Animations**: Hardware-accelerated transforms

## Accessibility

- **Touch Target Size**: Minimum 44x44px (WCAG AAA)
- **Visual Feedback**: Clear indication of draggable items
- **Error Prevention**: Movement tolerance during long press
- **Haptic Feedback**: Physical confirmation of actions

## User Experience

### Desktop
- Standard drag-and-drop with mouse
- Hover states
- Cursor changes (grab/grabbing)

### Mobile/Tablet
- Long-press to activate drag
- Visual clone follows finger
- Haptic feedback
- No accidental scrolling
- Touch-optimized sizes

### Hybrid Devices
- Automatic detection of input method
- Seamless switching between touch and mouse
- Optimal experience for each input type

## Troubleshooting

### Issue: Drag not starting
**Solution**: Ensure 200ms long press without moving >10px

### Issue: Page scrolls during drag
**Solution**: Verify `touch-action: none` is applied

### Issue: No haptic feedback
**Solution**: Not all devices support vibration (iOS Safari requires user gesture)

### Issue: Clone not appearing
**Solution**: Check browser console for errors, verify DOM manipulation permissions

## Future Enhancements

- [ ] Multi-touch gestures (pinch-to-zoom)
- [ ] Touch gestures for connections
- [ ] Swipe actions for quick edits
- [ ] Force Touch support (3D Touch)
- [ ] Pen/Stylus support

## Code Examples

### Testing Touch Events
```javascript
// Simulate touch event in browser console
const touch = new Touch({
  identifier: Date.now(),
  target: document.querySelector('.azure-icon'),
  clientX: 100,
  clientY: 100,
  radiusX: 10,
  radiusY: 10,
  rotationAngle: 0,
  force: 1
});

const touchEvent = new TouchEvent('touchstart', {
  touches: [touch],
  targetTouches: [touch],
  changedTouches: [touch],
  bubbles: true,
  cancelable: true
});

element.dispatchEvent(touchEvent);
```

## References

- [Touch Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Pointer Events - W3C](https://www.w3.org/TR/pointerevents/)
- [WCAG Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Web Best Practices](https://www.w3.org/TR/mobile-bp/)

---

**Last Updated**: February 13, 2026
**Version**: 2.0.0
