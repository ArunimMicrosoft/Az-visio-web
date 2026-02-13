# 🧪 Scrollable Canvas - Testing Guide

## Quick Test Steps

### ✅ Test 1: Basic Scrolling
1. Open the app at `http://localhost:5173`
2. Look for scrollbars on right and bottom edges
3. Try scrolling horizontally and vertically
4. Notice the canvas size indicator in bottom-right: "📐 Canvas: 5000 × 5000 px"

**Expected Result**: Smooth scrolling with Azure-blue custom scrollbars

---

### ✅ Test 2: Drag & Drop at Different Positions

#### Part A - Top Left Area
1. Scroll to top-left corner (0, 0)
2. Drag "Virtual Machine" from toolbar
3. Drop it in top-left corner
4. Item should appear where you dropped it

#### Part B - Bottom Right Area
1. Scroll to bottom-right corner (5000, 5000)
2. Drag "Storage Account" from toolbar
3. Drop it near the canvas size indicator
4. Item should appear at correct position

#### Part C - After Scrolling
1. Scroll to middle of canvas (2500, 2500)
2. Drag "App Service" from toolbar
3. Drop it in center of viewport
4. Item should appear where you dropped it

**Expected Result**: All items placed accurately regardless of scroll position

---

### ✅ Test 3: Move Items While Scrolled

1. Place a "Virtual Machine" in top-left corner
2. Scroll down 1000 pixels
3. Scroll back to top and drag the VM down
4. Item should move smoothly with your mouse
5. Release and verify position is correct

**Expected Result**: Items drag smoothly regardless of scroll position

---

### ✅ Test 4: Connections Across Distance

1. Place "Virtual Machine" at position (500, 500)
2. Scroll to far right side
3. Place "Storage Account" at position (4000, 500)
4. Scroll back to VM
5. Right-click VM to start connection
6. Scroll to Storage Account
7. Click Storage Account to complete connection

**Expected Result**: Connection line drawn correctly between items far apart

---

### ✅ Test 5: Connection Visibility While Scrolling

1. Create 2 connected items (VM → Storage)
2. Scroll horizontally slowly
3. Watch the connection line
4. Notice LED indicator moves with items
5. Connection should stay attached to both items

**Expected Result**: Connections remain visible and correctly positioned during scroll

---

### ✅ Test 6: Canvas Size Indicator

1. Check bottom-right corner of canvas
2. See blue badge showing "📐 Canvas: 5000 × 5000 px"
3. Resize browser window
4. Indicator should remain visible

**Expected Result**: Always visible size indicator with correct dimensions

---

### ✅ Test 7: Grid Pattern

1. Look at canvas background
2. Notice subtle grid lines (20px spacing)
3. Scroll around - grid should cover entire canvas
4. Grid helps with visual alignment

**Expected Result**: Consistent grid pattern across entire 5000×5000px area

---

### ✅ Test 8: Mobile/Responsive (Optional)

#### Desktop (Normal)
- Canvas: 5000×5000px
- Grid: 20px spacing
- Scrollbar: 12px width

#### Tablet (< 768px)
1. Resize browser to 768px width
2. Canvas should be 3000×3000px
3. Scrollbar should be 8px width
4. Indicator shows "📐 3000 × 3000 px"

#### Mobile (< 480px)
1. Resize browser to 480px width
2. Canvas should be 2000×2000px
3. Indicator shows "📐 2000 × 2000 px"

**Expected Result**: Canvas adapts to screen size for optimal performance

---

### ✅ Test 9: Save and Load

1. Create diagram with items at various positions (including far corners)
2. Click "Save" - downloads JSON file
3. Clear canvas
4. Click "Load" - select saved file
5. All items should appear at correct positions

**Expected Result**: Save/Load works correctly with scrollable canvas

---

### ✅ Test 10: Export Functions

1. Create diagram with items spread across canvas
2. Scroll to show specific area
3. Export to PNG
4. **Note**: Only visible area is exported (current limitation)
5. Try Export to JSON, Terraform, ARM - should work normally

**Expected Result**: Exports work (PNG captures visible viewport)

---

## 🎯 Success Criteria

### Must Work:
- ✅ Scrollbars appear and work smoothly
- ✅ Canvas size indicator visible
- ✅ Grid pattern extends across full canvas
- ✅ Drop items at any position (accounting for scroll)
- ✅ Drag items smoothly when scrolled
- ✅ Connections draw correctly at any position
- ✅ LED indicators follow connected items
- ✅ Save/Load preserves item positions
- ✅ No breaking of existing features

### Known Limitations:
- ⚠️ PNG/PDF export captures visible viewport only (future enhancement)
- ⚠️ Very old devices may have slight performance impact

---

## 🐛 If Something Doesn't Work

### Items appear at wrong position after drop:
- **Check**: Browser console for errors
- **Likely cause**: Scroll offset calculation issue
- **Fix**: Verify `containerRef.current.scrollLeft/Top` is working

### Connections don't follow items:
- **Check**: SVG positioning in inspector
- **Likely cause**: SVG not accounting for scroll
- **Note**: SVG is positioned absolutely, should work with absolute item positions

### Scrollbars don't appear:
- **Check**: Canvas size in inspector (should be 5000×5000)
- **Check**: Container has `overflow: auto`
- **Try**: Refresh browser, hard reload (Ctrl+Shift+R)

### Performance issues:
- **Try**: Reduce canvas size in CSS (change 5000 to 3000)
- **Try**: Clear browser cache
- **Check**: Number of items on canvas (500+ may be slow on old hardware)

---

## 📊 Visual Checklist

When you open the app, you should see:

```
┌─────────────────────────────────────────────────────┐
│ 🎨 Azure Architecture Designer           [Controls] │
├─────────────────────────────────────────────────────┤
│ [Toolbar with Azure service icons]                  │
├─────────────────────────────────────────────────────┤
│ [Canvas Container - Scrollable]                    ││
│ ┌─────────────────────────────────────────────────┐││
│ │ 🎨 Drag and drop Azure services here            │││
│ │                                                  │││
│ │         [Your architecture items here]          │││
│ │                                                  │││
│ │                                                  │││
│ │                                                  │││
│ │                           📐 5000 × 5000 px     │││
│ └─────────────────────────────────────────────────┘││
│ ══════════════════════════════════════════════════╧│ ← Scrollbar
├─────────────────────────────────────────────────────┤
│ Footer: Cost | Region | Currency                    │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Quick Pass/Fail Test

Run through these 5 quick tests:

1. ✅ Scroll horizontally and vertically
2. ✅ Drop item in top-left corner after scrolling
3. ✅ Drop item in bottom-right corner after scrolling
4. ✅ Drag item while scrolled away from origin
5. ✅ Create connection between items 2000px apart

If all 5 pass: **✅ IMPLEMENTATION SUCCESSFUL**

If any fail: **❌ See troubleshooting section above**

---

**Happy Testing! 🚀**
