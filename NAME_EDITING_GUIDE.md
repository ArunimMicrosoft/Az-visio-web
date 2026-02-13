# ✏️ Name Editing Feature - Quick Reference

## 🎯 Overview
Edit service names to distinguish between multiple instances of the same Azure service (e.g., VM1, VM2, Production-SQL, Dev-SQL).

---

## 📖 How to Use

### Basic Usage:
1. **Add a service** to the canvas (drag from toolbar)
2. **Double-click** on the service name (text below the icon)
3. **Type** your custom name
4. **Press Enter** to save (or click outside)

### Keyboard Shortcuts:
| Key | Action |
|-----|--------|
| **Double-click** | Start editing |
| **Enter** | Save name |
| **Escape** | Cancel editing |
| **Click outside** | Auto-save |

---

## 💡 Example Use Cases

### Scenario 1: Multiple VMs
```
Before: Virtual Machine, Virtual Machine, Virtual Machine
After:  Web-Server-VM, API-Server-VM, Database-VM
```

### Scenario 2: Environment Separation
```
Before: SQL Database, SQL Database
After:  Production-SQL, Development-SQL
```

### Scenario 3: Instance Numbering
```
Before: Redis Cache, Redis Cache, Redis Cache
After:  Redis-Cache-01, Redis-Cache-02, Redis-Cache-03
```

### Scenario 4: Functional Names
```
Before: Load Balancer, Application Gateway
After:  Frontend-LB, API-Gateway
```

### Scenario 5: Regional Architecture
```
Before: Storage Account, Storage Account
After:  EastUS-Storage, WestUS-Storage
```

---

## ✨ Features

### Visual Feedback:
- ✅ Hover effect on labels (background highlights)
- ✅ Blue border when editing
- ✅ Auto-focus and text selection
- ✅ Tooltip: "Double-click to edit name"

### Smart Behavior:
- ✅ Prevents dragging while editing
- ✅ Stops propagation of events
- ✅ Trims whitespace on save
- ✅ Reverts to original if empty
- ✅ Updates in real-time

### Integration:
- ✅ Names persist across save/load
- ✅ Names included in JSON exports
- ✅ Names used in Terraform resource names
- ✅ Names shown in cost breakdown
- ✅ Names visible in connections

---

## 🎨 UI Elements

### Normal State:
```
┌──────────────┐
│   [VM Icon]  │
│              │
│ Virtual      │  ← Hover shows highlight
│ Machine      │  ← Double-click to edit
└──────────────┘
```

### Editing State:
```
┌──────────────┐
│   [VM Icon]  │
│              │
│ ┌──────────┐ │
│ │Web-VM-01▌│ │  ← Blue border, focused
│ └──────────┘ │
└──────────────┘
```

---

## 🔧 Technical Details

### Modified Files:
- `src/components/Canvas-new.jsx` - Logic
- `src/components/Canvas.css` - Styling
- `src/components/ControlPanel.jsx` - Help text

### State Management:
```javascript
const [editingItem, setEditingItem] = useState(null);     // ID of item being edited
const [editingName, setEditingName] = useState('');       // Current name value
```

### Key Functions:
```javascript
handleStartEdit(e, item)      // Double-click handler
handleSaveName(itemId)         // Save edited name
handleCancelEdit()             // Cancel editing
handleNameKeyDown(e, itemId)   // Keyboard shortcuts
```

### CSS Classes:
```css
.item-label             /* Normal label */
.item-label:hover       /* Hover effect */
.item-label-edit        /* Edit input field */
```

---

## 📝 Best Practices

### Naming Conventions:

**DO:**
- ✅ Use descriptive names: "Frontend-Web-VM"
- ✅ Include environment: "Prod-SQL", "Dev-SQL"
- ✅ Use numbers for instances: "VM-01", "VM-02"
- ✅ Include region: "EastUS-Storage"
- ✅ Use hyphens or underscores: "Web_Server"
- ✅ Keep it concise (under 20 chars for readability)

**DON'T:**
- ❌ Use special characters: `@#$%^&*()`
- ❌ Make names too long: "This-Is-A-Very-Long-Service-Name-That-Wraps"
- ❌ Use spaces excessively: "My   Service   Name"
- ❌ Leave names empty (reverts to default)

### Recommended Patterns:

**Pattern 1: Environment-Service-Number**
```
Prod-Web-01
Prod-Web-02
Dev-API-01
```

**Pattern 2: Function-Location-Type**
```
Frontend-EastUS-VM
Backend-WestUS-VM
Database-CentralUS-SQL
```

**Pattern 3: Service-Purpose-Instance**
```
Redis-Cache-Primary
Redis-Cache-Secondary
SQL-Master-DB
SQL-Replica-DB
```

---

## 🐛 Troubleshooting

### Issue: Double-click doesn't work
**Solution:** Make sure you're clicking on the **name text**, not the icon

### Issue: Name doesn't save
**Solution:** Press Enter or click outside. Don't press Escape (cancels)

### Issue: Name is too long
**Solution:** Use abbreviations or shorter names (max ~20 chars recommended)

### Issue: Special characters don't work
**Solution:** Use alphanumeric, hyphens, or underscores only

### Issue: Can't drag while editing
**Solution:** This is intentional. Press Enter to save, then drag

---

## 🎬 Video Tutorial Steps

1. **Open the app** in your browser
2. **Drag 2 VMs** to the canvas
3. **Double-click** on the first VM's name
4. **Type** "Web-Server-VM"
5. **Press Enter** to save
6. **Double-click** on the second VM's name
7. **Type** "Database-VM"
8. **Press Enter** to save
9. **Connect them** with right-click
10. **Export** as Terraform or ARM template
11. **See** your custom names in the generated code!

---

## 📊 Benefits

| Benefit | Description |
|---------|-------------|
| **Clarity** | Instantly know which service is which |
| **Organization** | Group services by environment/region |
| **Documentation** | Names appear in exports and diagrams |
| **Collaboration** | Team members understand architecture faster |
| **Deployment** | Terraform/ARM templates use readable resource names |

---

## 🔗 Integration with Other Features

### With Terraform Export:
```hcl
resource "azurerm_virtual_machine" "web_server_vm" {
  name = "Web-Server-VM"
  # ... other config
}
```

### With Cost Breakdown:
```
Service Name          | Quantity | Cost
---------------------|----------|------
Web-Server-VM        | 1        | $29.20
Database-VM          | 1        | $29.20
Production-SQL       | 1        | $186.00
```

### With Save/Load:
```json
{
  "items": [
    {
      "id": 1234567890,
      "name": "Web-Server-VM",
      "serviceType": "vm",
      "x": 100,
      "y": 100
    }
  ]
}
```

---

## 🎯 Summary

**What:** Edit service names by double-clicking  
**Why:** Distinguish between multiple instances  
**How:** Double-click → Type → Enter  
**Where:** On any service on the canvas  
**When:** After placing services  

**Status:** ✅ **FULLY IMPLEMENTED AND WORKING**

---

## 📚 See Also

- [COMPLETE_FEATURE_UPDATE.md](COMPLETE_FEATURE_UPDATE.md) - All features overview
- [USER_GUIDE.md](USER_GUIDE.md) - Complete user guide
- [HOW_TO_CONNECT.md](HOW_TO_CONNECT.md) - Connection guide

---

**Last Updated:** February 13, 2026  
**Feature Version:** 2.0.0  
**Status:** ✅ Production Ready
