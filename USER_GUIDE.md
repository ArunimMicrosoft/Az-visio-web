# Azure Architecture Designer - Complete User Guide

## 🎯 Overview
A professional web application for designing Azure cloud architecture diagrams with intelligent connection validation, similar to Microsoft Visio. Built with React + Vite.

**Built by: Arunim Pandey**

---

## 🚀 Getting Started

### Installation & Running
```bash
npm install
npm run dev
```
Open browser at: **http://localhost:5173**

---

## 📋 How to Use

### 1. Adding Azure Services to Canvas

**Step-by-Step:**
1. Look at the **left sidebar** - it has 8 category tabs:
   - 🖥️ Compute (VMs, App Services, Functions, AKS)
   - 💾 Storage (Storage Accounts, Data Lake, File Shares)
   - 🗄️ Databases (SQL, Cosmos DB, MySQL, PostgreSQL)
   - 🌐 Networking (VNet, Load Balancers, VPN Gateway)
   - 🔐 Security (Key Vault, Sentinel, Defender)
   - 🔄 Integration (Service Bus, Event Hubs, API Management)
   - 📊 Monitoring (Monitor, Application Insights, Log Analytics)
   - 🤖 AI + ML (Cognitive Services, OpenAI, Machine Learning)

2. Click a category tab to see available services
3. **Drag** an icon from the sidebar
4. **Drop** it anywhere on the white canvas area
5. The service appears with its official Azure icon and name

---

### 2. Connecting Services (With Validation!)

Azure Architecture Designer validates connections against Azure best practices!

**Three Ways to Start a Connection:**
- **Method 1:** Right-click on a service
- **Method 2:** Hold Ctrl + Click on a service  
- **Method 3:** Hold Shift + Click on a service

**Complete the Connection:**
1. After starting (service turns green), click on another service
2. A connection line appears with an **LED indicator** at the midpoint
3. The LED color shows validation status:
   - 🟢 **Green LED** = Valid Azure pattern (recommended)
   - 🟡 **Yellow LED** = Uncommon connection (verify if needed)
   - 🔴 **Red LED** = Invalid pattern (violates best practices)

**Pro Tips:**
- **Hover over the LED** to see:
  - Which services are connected (e.g., "vm → storage")
  - Validation status
  - Helpful recommendations
- Press **ESC** to cancel connection mode
- Connections follow the arrow direction (from → to)

---

### 3. Understanding Connection Validation

The app validates connections against **Azure best practices**:

#### ✅ Valid Connections (Green LED)
Examples:
- **VM → Storage**: VMs commonly use storage for disks
- **App Service → SQL Database**: Standard web app pattern
- **Function App → Cosmos DB**: Serverless with NoSQL
- **AKS → Load Balancer**: Kubernetes with external access
- **Any Service → Key Vault**: Secure secrets management
- **Any Service → Monitor**: Monitoring and logging

#### ⚠️ Warning Connections (Yellow LED)
Examples:
- **VM → Cosmos DB**: Possible but uncommon
- **VM → Event Hubs**: Usually better patterns exist
- **Function → VM**: Consider serverless alternatives

#### ❌ Invalid Connections (Red LED)
Examples:
- Direct connections that violate security best practices
- Missing intermediary services (e.g., should use API Management)
- Architectural anti-patterns

**Important:** The app provides **recommendations** for invalid connections to help you fix your architecture!

---

### 4. Managing Items on Canvas

**Moving Items:**
- Click and drag any service to reposition it
- Connections automatically update

**Selecting Items:**
- Click on a service to select it (blue border appears)
- A delete button (×) appears in the top-right corner

**Deleting Items:**
- **Method 1:** Select item → Press **DELETE** key
- **Method 2:** Select item → Click the **×** button
- All connections to/from the deleted item are also removed

---

### 5. Saving & Exporting Your Work

The **top control panel** has 6 buttons:

#### 💾 Save
- Saves diagram to **browser localStorage**
- Persists even after closing browser
- Includes all items and connections with validation data

#### 📂 Load
- Restores previously saved diagram
- All services and connections are restored
- Validation status is preserved

#### 📤 JSON Export
- Downloads diagram as `.json` file
- Includes all architecture data:
  - Service types and positions
  - Connections with validation status
  - Timestamps for version control
- Use for backup or sharing

#### 🖼️ PNG Export
- Exports canvas as high-resolution PNG image (2x scale)
- Perfect for presentations and documentation
- Excludes UI elements (only exports canvas)
- Filename includes timestamp

#### 📄 PDF Export
- Exports as professional PDF document
- Auto-detects orientation (landscape/portrait)
- High quality for printing
- Filename includes timestamp

#### 🗑️ Clear
- Removes all items from canvas
- Shows confirmation dialog
- Cannot be undone (use Save first!)

---

## 🎨 Best Practices

### Designing Good Azure Architectures

1. **Start with core services**
   - Place VMs, App Services, or Functions first
   - Add databases (SQL, Cosmos DB)
   - Connect storage

2. **Add networking**
   - VNets for isolation
   - Load Balancers for distribution
   - VPN Gateways for hybrid connectivity

3. **Secure your architecture**
   - Connect services to Key Vault for secrets
   - Add Security services (Sentinel, Defender)
   - Review connection validations

4. **Monitor everything**
   - Connect all services to Monitor
   - Add Application Insights for apps
   - Use Log Analytics for centralized logs

5. **Pay attention to LEDs!**
   - Fix all red (invalid) connections first
   - Review yellow (warning) connections
   - Green connections = you're following best practices! 🎉

---

## 🔧 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Delete** | Remove selected item |
| **ESC** | Cancel connection mode |
| **Right-click** | Start connection |
| **Ctrl+Click** | Start connection (alternative) |
| **Shift+Click** | Start connection (alternative) |

---

## 📊 Available Azure Services (50+)

### Compute
- Virtual Machine, VM Scale Sets, Function Apps, App Services, AKS, Batch Accounts, Disks, Availability Sets

### Storage
- Storage Accounts, Data Lake Storage, Azure NetApp Files, Data Box, File Shares, Recovery Services Vaults

### Databases
- SQL Database, Cosmos DB, MySQL, PostgreSQL, MariaDB, Synapse Analytics, Data Factory

### Networking
- Virtual Networks, Load Balancers, VPN Gateway, DNS Zones, Traffic Manager, Bastion, Firewalls, Application Gateway

### Security
- Key Vault, Azure Sentinel, Defender for Cloud, Application Security Groups

### Integration
- Service Bus, Event Hubs, API Management, Logic Apps, Event Grid

### Monitoring
- Monitor, Application Insights, Log Analytics

### AI + ML
- Cognitive Services, Machine Learning, Azure OpenAI, Bot Services

---

## ❓ FAQ

**Q: Why is my connection showing a red LED?**
A: The connection violates Azure best practices. Hover over the LED to see the recommendation.

**Q: Can I connect the same services multiple times?**
A: Yes! You can create multiple connections between different instances of the same service type.

**Q: How do I cancel connection mode?**
A: Press **ESC** or click on empty canvas area.

**Q: Where are my saved diagrams stored?**
A: In browser's localStorage. They persist across sessions but are local to your browser/device.

**Q: Can I export without the sidebar and buttons?**
A: Yes! PNG and PDF exports show only the canvas area (no UI elements).

**Q: What happens if I use an invalid connection?**
A: The app shows it with a red LED and provides guidance, but doesn't prevent it. You decide!

---

## 🆘 Troubleshooting

**Problem: Icons won't drag**
- Solution: Make sure you're dragging FROM the left sidebar TO the canvas

**Problem: Can't start connection**
- Solution: Try all three methods: Right-click, Ctrl+Click, or Shift+Click

**Problem: Connection doesn't show validation**
- Solution: The validation runs automatically. Hover over the LED for details.

**Problem: Lost my diagram**
- Solution: Use JSON export regularly as backup. Browser localStorage can be cleared.

**Problem: Export buttons not working**
- Solution: Check browser console (F12) for errors. Some browsers block downloads.

---

## 🎓 Example Architecture Patterns

### 3-Tier Web Application
1. Add: App Service → SQL Database → Storage Account
2. Connect: App Service → SQL (Green: Valid)
3. Connect: App Service → Storage (Green: Valid)
4. Add: Application Insights
5. Connect: App Service → App Insights (Green: Valid)

### Serverless Architecture
1. Add: Function App → Cosmos DB → Storage Account
2. Connect: Function → Cosmos (Green: Valid)
3. Connect: Function → Storage (Green: Valid)
4. Add: Event Hub
5. Connect: Event Hub → Function (Green: Valid)

### Enterprise Network
1. Add: Virtual Network → VPN Gateway → Load Balancer
2. Add: Multiple VMs
3. Connect: VMs → VNet (Green: Valid)
4. Connect: VNet → VPN Gateway (Green: Valid)
5. Connect: Load Balancer → VMs (Green: Valid)

---

## 📞 Support & Feedback

**Built by:** Arunim Pandey  
**Technology:** React 19 + Vite 7  
**Validation:** Based on Azure Well-Architected Framework  

**Features:**
- ✅ Drag-and-drop interface
- ✅ Visio-style connections (Right-click/Ctrl/Shift)
- ✅ Real-time validation with LED indicators
- ✅ 50+ official Azure service icons
- ✅ Export to PNG/PDF/JSON
- ✅ Save/Load functionality
- ✅ Professional UI with helpful tooltips

---

## 🎉 Tips for Success

1. **Read the tooltips** - Hover over LEDs for validation details
2. **Save frequently** - Use the Save button or export JSON
3. **Follow the colors** - Green = good, Yellow = review, Red = fix
4. **Start simple** - Add a few services first, then expand
5. **Use categories** - Organize by clicking the 8 category tabs
6. **Export early, export often** - Download PNG/PDF for documentation

---

**Enjoy building your Azure architectures! 🚀☁️**

*This tool helps you design better cloud architectures by providing real-time validation against Azure best practices.*
