# 🚨 DEV SERVER START GUIDE

## Issue: Connection Refused (ERR_CONNECTION_REFUSED)

The dev server is **not running**. You need to start it manually.

---

## ✅ Quick Fix - Start Dev Server

### **Option 1: Double-click the batch file** (Easiest)
1. In File Explorer, navigate to project folder
2. Double-click: `START_DEV_SERVER.bat`
3. Server will start and open browser automatically

### **Option 2: Use PowerShell** (Recommended)
```powershell
# Open PowerShell in project folder
.\START_DEV_SERVER.ps1
```

### **Option 3: Manual NPM command**
```bash
npm run dev
```

---

## 🌐 Access the App

After starting the server, open in browser:
```
http://localhost:5173
```

**Note:** The server must be running for the app to work.

---

## 🎯 Once Server is Running - Test Trial System

### **Quick Trial Test (5 minutes)**

1. **Sign Up New User:**
   - Email: `trial-test@example.com`
   - Password: `Test123!@#`
   - Click "Create Account"

2. **✅ Check Trial Banner:**
   - Look at top of page
   - Should show: "🎁 Trial Active - 7 days • 5/5 PNG exports • 3/3 diagrams"

3. **✅ Test PNG Export Limit:**
   - Drag 2 services onto canvas (e.g., VM, Storage)
   - Click "Export" → "Export as PNG"
   - Confirm dialog shows: "4 exports remaining"
   - Repeat 5 times total
   - **6th export should be BLOCKED** with upgrade modal

4. **✅ Test Premium Export Block:**
   - Click "Export" → "Export as SVG"
   - **Upgrade modal should appear immediately**
   - Try PDF, JSON, Terraform - all should be blocked

5. **✅ Test Diagram Limit:**
   - Click "Clear Canvas" (counts as new diagram)
   - Do this 3 times
   - **4th time should be BLOCKED** with upgrade modal

---

## 🔍 Verify Trial System is Working

### **In Browser Console (F12):**

Check localStorage:
```javascript
JSON.parse(localStorage.getItem('azureDesigner_user'))
```

**Expected output:**
```json
{
  "subscriptionTier": "trial",
  "trialStartDate": "2026-03-08T...",
  "trialExpiresAt": "2026-03-15T...",  // 7 days from now
  "trialExportsUsed": 0,
  "diagramsCreated": 0
}
```

### **Check Trial Status:**
```javascript
// In console
const user = JSON.parse(localStorage.getItem('azureDesigner_user'));
console.log('Trial Tier:', user.subscriptionTier);
console.log('Expires:', new Date(user.trialExpiresAt));
console.log('Exports Used:', user.trialExportsUsed);
console.log('Diagrams Created:', user.diagramsCreated);
```

---

## ✅ Trial System Checklist

Mark each as you test:

- [ ] Trial banner appears after signup
- [ ] Banner shows "7 days" remaining
- [ ] Banner shows "5/5 PNG exports"
- [ ] Banner shows "3/3 diagrams"
- [ ] PNG export works (first 5 times)
- [ ] PNG counter decrements: 4/5, 3/5, 2/5, 1/5, 0/5
- [ ] 6th PNG export blocked with upgrade modal
- [ ] SVG export blocked immediately
- [ ] PDF export blocked immediately
- [ ] JSON export blocked immediately
- [ ] Terraform export blocked immediately
- [ ] ARM export blocked immediately
- [ ] Cost Report export blocked immediately
- [ ] Clear Canvas works (first 3 times)
- [ ] 4th Clear Canvas blocked with upgrade modal
- [ ] "Upgrade Now" button goes to payment page
- [ ] Trial data persists after page reload

---

## 🎉 Success Criteria

**Trial System is WORKING if:**

1. ✅ **Trial Banner Shows**
   ```
   🎁 Trial Active  7 days • 5/5 PNG exports • 3/3 diagrams [Upgrade Now]
   ```

2. ✅ **PNG Exports Limited to 5**
   - First 5 work with countdown
   - 6th shows upgrade modal

3. ✅ **Premium Exports Blocked**
   - SVG, PDF, JSON, Terraform, ARM, Cost Report all show upgrade modal

4. ✅ **Diagrams Limited to 3**
   - First 3 clear/create operations work
   - 4th shows upgrade modal

5. ✅ **Data Persists**
   - localStorage has trial fields
   - Counters update correctly

---

## 🐛 Troubleshooting

### **Trial Banner Not Showing:**

1. Check console for errors (F12)
2. Verify user data:
   ```javascript
   JSON.parse(localStorage.getItem('azureDesigner_user'))
   ```
3. Clear cache and sign up again:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### **Export Limits Not Working:**

1. Check counter updates in banner
2. Verify localStorage:
   ```javascript
   let user = JSON.parse(localStorage.getItem('azureDesigner_user'));
   console.log('Exports:', user.trialExportsUsed);
   console.log('Diagrams:', user.diagramsCreated);
   ```
3. Check console for errors in `canExportPNG()` function

### **Upgrade Modal Not Showing:**

1. Check if `UpgradeModal.jsx` exists
2. Verify import in `App.jsx`
3. Check console for React errors

---

## 📸 Visual Guide

### **1. Trial Banner (Expected)**
```
┌───────────────────────────────────────────────────────────────┐
│ 🎁 Trial Active  7 days • 5/5 PNG exports • 3/3 diagrams     │
│                                               [Upgrade Now]  │
└───────────────────────────────────────────────────────────────┘
```

### **2. PNG Export Confirmation (Expected)**
```
┌─────────────────────────────────────────────┐
│   PNG Export                                │
│   (4 exports remaining after this)          │
│                                             │
│   Click OK to continue or Cancel to upgrade │
│                                             │
│   [OK]  [Cancel]                           │
└─────────────────────────────────────────────┘
```

### **3. Upgrade Modal (Expected)**
```
┌───────────────────────────────────────────────────┐
│  Upgrade Required                                 │
│                                                   │
│  SVG Export requires Professional plan            │
│                                                   │
│  Plans:                                           │
│  • Starter: FREE                                  │
│  • Professional: $49/mo (Most Popular)            │
│  • Enterprise: $199/mo                            │
│                                                   │
│  [Choose Professional]  [Close]                   │
└───────────────────────────────────────────────────┘
```

---

## 📁 Key Files Reference

**Trial Components:**
- `src/components/TrialBanner.jsx` - Banner component
- `src/components/TrialBanner.css` - Banner styling
- `src/components/UpgradeModal.jsx` - Upgrade modal
- `src/components/UpgradeModal.css` - Modal styling

**Trial Logic:**
- `src/utils/authSecurity.js` - Trial functions
  - `getTrialStatus()` - Check trial status
  - `canExportPNG()` - Validate PNG export
  - `canCreateDiagram()` - Validate diagram creation
  - `recordPNGExport()` - Track PNG usage
  - `recordDiagramCreation()` - Track diagram usage

**Integration:**
- `src/App.jsx` - Export handlers with trial checks

---

## 🚀 Next Steps After Confirmation

If all tests pass:

1. ✅ Mark trial system as COMPLETE
2. Configure Stripe products (get Price IDs)
3. Set up Azure Functions backend
4. Configure webhooks
5. Deploy to Azure

---

## 📞 Quick Commands

**Start dev server:**
```bash
npm run dev
```

**Open app:**
```
http://localhost:5173
```

**Check trial data:**
```javascript
JSON.parse(localStorage.getItem('azureDesigner_user'))
```

**Reset trial (test fresh):**
```javascript
localStorage.clear();
location.reload();
```

---

**Status:** ⏸️ Waiting for dev server to start  
**Next Action:** Start server and test trial system  
**Estimated Test Time:** 5-10 minutes
