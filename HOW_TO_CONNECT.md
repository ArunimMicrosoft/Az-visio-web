# How to Connect Azure Icons

## 🔗 Connection Feature Guide

The Azure Architecture Designer allows you to create connections between Azure services to visualize data flow and relationships.

## Step-by-Step Instructions

### Method 1: Using Shift + Click (Recommended)

1. **Place at least 2 icons** on the canvas
2. **Hold down the SHIFT key** on your keyboard
3. **Click on the first icon** you want to connect (it will turn green with a border)
4. **While still holding SHIFT**, click on the second icon
5. A connection line with an arrow will appear between the two icons

### Visual Indicators

- **Purple Banner**: Appears when you hold SHIFT - indicates connection mode is active
- **Green Banner**: Appears after clicking the first icon - confirms selection and prompts for second icon
- **Green Border**: Shows around the first selected icon while waiting for the second click

## Troubleshooting

### Connections not appearing?

✅ **Checklist:**
- [ ] Are you holding the SHIFT key while clicking?
- [ ] Did you click on the first icon while holding SHIFT?
- [ ] Did you keep SHIFT pressed while clicking the second icon?
- [ ] Are there at least 2 icons on the canvas?

### Common Mistakes

❌ **Don't do this:**
- Clicking icons without holding SHIFT
- Releasing SHIFT between clicks
- Clicking the same icon twice

✅ **Do this:**
- Hold SHIFT → Click Icon 1 → Keep holding SHIFT → Click Icon 2

## Managing Connections

### Deleting Connections
- When you delete an icon, all connections to/from that icon are automatically removed
- Currently, there's no way to delete individual connections without removing the icons

### Best Practices

1. **Plan your layout first**: Position icons before connecting them
2. **Work in layers**: Add all compute resources, then storage, then connect them
3. **Use consistent patterns**: Data flow typically goes left-to-right or top-to-bottom

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| SHIFT + Click | Create connection between two items |
| DELETE | Remove selected item (and its connections) |
| Click | Select/Move item |
| ESC | Deselect item (future feature) |

## Video Tutorial

**Connection Demo:**
1. Drag a "Virtual Machine" icon to the canvas
2. Drag a "Storage Account" icon to the canvas
3. Hold SHIFT
4. Click on the Virtual Machine (should turn green)
5. Still holding SHIFT, click on the Storage Account
6. A blue arrow appears showing the connection!

## Tips

💡 **Pro Tips:**
- The arrow direction shows data/dependency flow
- Group related services before connecting
- Use the connection feature to document:
  - Data flows
  - Dependencies
  - Network communication paths
  - Authentication flows

## Need More Help?

- Click the **❓ Help** button in the top-right corner of the app
- Check the placeholder text on the empty canvas
- Look for the purple/green status banners when holding SHIFT

---

**Happy Connecting! 🎨✨**
