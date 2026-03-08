# 🧪 Trial System Testing Guide

## ✅ Current Status
- **Frontend Dev Server**: Running on http://localhost:5173
- **Azure Functions API**: Ready (need to start manually)
- **Trial System**: Fully implemented and ready for testing

---

## 🚀 Quick Start

### 1. Start the API Server (Manual Step Required)

Open a **new terminal** and run:
```powershell
cd "c:\Users\labadmin\Desktop\python-mini\Az visio web\api"
func start
```

Expected output:
```
Functions:
  CreateCheckoutSession: [POST] http://localhost:7071/api/create-checkout-session
  CreatePortalSession: [POST] http://localhost:7071/api/create-portal-session
  Health: [GET] http://localhost:7071/api/health
  VerifyCheckoutSession: [POST] http://localhost:7071/api/verify-checkout-session
  Webhook: [POST] http://localhost:7071/api/webhook

For detailed output, run func with --verbose flag.
```

### 2. Open the Application

The app should already be open in your browser at: **http://localhost:5173**

If not, open it manually or click here: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Test Cases

### ✅ Test 1: Sign Up & Trial Auto-Start

**Steps:**
1. On the landing page, click **"Get Started"** or **"Sign In"**
2. Click **"Don't have an account? Sign up"**
3. Enter test credentials:
   - **Email**: test-trial@example.com
   - **Password**: Test123!
   - **Name**: Trial Tester
4. Click **"Sign Up"**

**Expected Results:**
- ✅ Redirected to the main app
- ✅ Trial banner appears at the top: 
  ```
  🎁 Trial Active | 7 days • 5/5 PNG exports • 3/3 diagrams | [Upgrade Now]
  ```
- ✅ User subscription tier is "trial" (check in browser console if needed)

**Screenshot Location:**
- Trial banner should be visible at the very top of the canvas area

---

### ✅ Test 2: PNG Export Limit (5 Exports)

**Steps:**
1. Drag 2-3 Azure services onto the canvas (e.g., VM, Storage Account)
2. Click **"Export"** → **"Export as PNG"**
3. Confirm the export
4. **Expected**: Browser shows download dialog with message:
   ```
   PNG Export (4 exports remaining after this)
   Click OK to continue or Cancel to upgrade.
   ```
5. Click **OK** and save the PNG
6. Repeat **4 more times** (total 5 exports)
7. On the **6th attempt**, the export should be **BLOCKED**

**Expected Results:**
- ✅ Export 1-5: Shows remaining count, downloads PNG
- ✅ Export 6+: **Upgrade Modal** appears with message:
  ```
  Trial Limit Reached
  You've used all 5 PNG exports in your trial.
  Upgrade to Professional or Enterprise for unlimited exports.
  ```

**Visual Check:**
- Trial banner updates in real-time: `4/5`, `3/5`, `2/5`, `1/5`, `0/5`
- Upgrade modal has clean design with plan comparison

---

### ✅ Test 3: Diagram Creation Limit (3 Diagrams)

**Steps:**
1. Add some components to the canvas
2. Click **"Clear Canvas"** (counts as creating a new diagram)
3. Confirm the clear action
4. Add more components
5. Clear again (2nd diagram)
6. Repeat one more time (3rd diagram)
7. Try to clear a **4th time**

**Expected Results:**
- ✅ First 3 clears: Work normally
- ✅ 4th clear: **Upgrade Modal** appears:
  ```
  Trial Limit Reached
  You've created 3 diagrams in your trial.
  Upgrade to create unlimited diagrams.
  ```

**Visual Check:**
- Trial banner shows: `3/3 diagrams`, `2/3 diagrams`, `1/3 diagrams`, `0/3 diagrams`

---

### ✅ Test 4: Blocked Exports (SVG, PDF, JSON, etc.)

**Steps:**
1. Create a diagram with 2-3 components
2. Try each of these exports:
   - **Export as SVG**
   - **Export as PDF**
   - **Export as JSON**
   - **Export Terraform**
   - **Export ARM Template**
   - **Generate Cost Report**

**Expected Results:**
For **ALL** of the above exports:
- ❌ Export is **immediately blocked**
- ✅ **Upgrade Modal** appears with feature-specific message:
  ```
  Feature Not Available in Trial
  SVG Export requires a paid subscription.
  Upgrade to Professional or Enterprise to unlock this feature.
  ```

**Visual Check:**
- Each blocked export shows appropriate feature name (SVG, PDF, etc.)
- Modal offers upgrade path with plan comparison

---

### ✅ Test 5: Trial Banner Real-Time Updates

**Steps:**
1. Sign in with trial account
2. Observe the trial banner throughout testing
3. Perform various actions (PNG exports, diagram creation)

**Expected Results:**
- ✅ Banner shows **live countdown**: "7 days", "6 days", etc.
- ✅ PNG export counter decrements: `5/5` → `4/5` → `3/5` → `2/5` → `1/5` → `0/5`
- ✅ Diagram counter decrements: `3/3` → `2/3` → `1/3` → `0/3`
- ✅ **"Upgrade Now"** button always visible

**Visual Elements:**
```
┌────────────────────────────────────────────────────────────┐
│ 🎁 Trial Active | 7 days • 3/5 PNG exports • 2/3 diagrams │
│                                        [Upgrade Now]        │
└────────────────────────────────────────────────────────────┘
```

---

### ✅ Test 6: Upgrade Modal Functionality

**Steps:**
1. Trigger any upgrade prompt (blocked export or limit reached)
2. Observe the modal design
3. Test modal interactions:
   - Click **"Upgrade to Professional"**
   - Click **"Upgrade to Enterprise"**
   - Click **"Continue Trial"** or close button (X)

**Expected Results:**
- ✅ Modal shows **3 plans side-by-side**:
  - **Starter** (Free Forever) - Limited features
  - **Professional** ($49/₹4,099) - Unlimited exports
  - **Enterprise** ($199/₹16,649) - All features + priority support
- ✅ Clicking upgrade buttons **redirects to Payment Page**
- ✅ Closing modal returns to app without changes

**Visual Check:**
- Modal is centered, has backdrop overlay
- Plan cards are well-designed with clear pricing
- "Most Popular" badge on Professional plan

---

### ✅ Test 7: Trial Expiration (Grace Period)

**Steps:**
1. **Simulate expired trial** (manual testing via browser console):
   ```javascript
   // Open browser DevTools (F12)
   // Run in Console:
   const user = JSON.parse(localStorage.getItem('users'))[0];
   user.trialExpiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
   localStorage.setItem('users', JSON.stringify([user]));
   location.reload();
   ```
2. Refresh the page
3. Observe the trial banner

**Expected Results:**
- ✅ Banner changes to **Grace Period Mode**:
  ```
  ⚠️ Grace Period | Your trial expired 1 day ago. Upgrade to continue. | [Upgrade Now]
  ```
- ✅ All features still work during grace period (2 days)
- ✅ After 2 days, features become fully restricted

**Visual Check:**
- Grace period banner has **warning style** (yellow/orange)
- Upgrade button more prominent

---

### ✅ Test 8: Boundary Dropdown Z-Index Fix

**Steps:**
1. Open the app (should be at http://localhost:5173)
2. Look at the **Control Panel** on the left side
3. Note the **back buttons** at the top of the panel
4. Click the **"Boundary"** button in the **Canvas Toolbar** (top-center area)
5. This activates boundary drawing mode and shows a dropdown

**Expected Results:**
- ✅ Boundary dropdown appears **BELOW** the control panel
- ✅ All control panel buttons remain **fully clickable**
- ✅ No visual overlap between dropdown and buttons
- ✅ Dropdown z-index: **50** (Canvas Toolbar)
- ✅ Control Panel z-index: **100** (higher, stays on top)

**Visual Check:**
```
Z-Index Hierarchy (Top to Bottom):
┌─────────────────────────────────────┐
│ 10,000 - Upgrade Modal              │
│  2,000 - Validation Panel           │
│  1,001 - Toolbar (main sidebar)     │
│  1,000 - Help Overlay               │
│    100 - Control Panel ← ACCESSIBLE │
│     50 - Canvas Toolbar ← BELOW     │
│      1 - Boundary Selector          │
│      0 - Canvas Content             │
└─────────────────────────────────────┘
```

**Before Fix:**
- ❌ Boundary dropdown had z-index 1000
- ❌ Control Panel had z-index 100
- ❌ Dropdown covered back buttons

**After Fix:**
- ✅ Canvas Toolbar forced to z-index 50
- ✅ Control Panel remains at z-index 100
- ✅ Buttons always accessible

---

## 🔍 Debugging Tips

### Check User Data in Browser Console

Press **F12** to open DevTools, then run:

```javascript
// Get current user
const session = JSON.parse(localStorage.getItem('currentSession'));
const users = JSON.parse(localStorage.getItem('users'));
const user = users?.find(u => u.id === session?.userId);

console.log('Current User:', user);
console.log('Subscription Tier:', user?.subscriptionTier);
console.log('Trial Expires:', user?.trialExpiresAt);
console.log('PNG Exports Used:', user?.trialExportsUsed);
console.log('Diagrams Created:', user?.diagramsCreated);
```

### Check Trial Status

```javascript
// In browser console
import { getTrialStatus } from './src/utils/authSecurity.js';
const status = getTrialStatus(user);
console.log('Trial Status:', status);
```

### Inspect Z-Index Values

```javascript
// Check boundary dropdown z-index
const toolbar = document.querySelector('.canvas-toolbar');
const controlPanel = document.querySelector('.control-panel');
console.log('Canvas Toolbar z-index:', getComputedStyle(toolbar).zIndex); // Should be 50
console.log('Control Panel z-index:', getComputedStyle(controlPanel).zIndex); // Should be 100
```

### Reset Trial for Re-Testing

```javascript
// Reset trial counters
const user = JSON.parse(localStorage.getItem('users'))[0];
user.trialExportsUsed = 0;
user.diagramsCreated = 0;
user.trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
localStorage.setItem('users', JSON.stringify([user]));
location.reload();
```

---

## 📊 Expected Console Logs

When testing, you should see these logs in the browser console:

### On Sign Up:
```
✅ User created with trial subscription
Trial expires at: 2026-03-15T...
```

### On PNG Export:
```
✅ PNG export allowed (4 remaining)
Recorded PNG export for user: user_123...
```

### On Blocked Export:
```
❌ SVG export blocked: Feature requires paid subscription
Showing upgrade modal for: SVG Export
```

### On Limit Reached:
```
❌ PNG export blocked: Trial limit reached (5/5 used)
Showing upgrade modal
```

---

## 🎨 Visual Checklist

### Trial Banner
- [ ] Visible at top of canvas area
- [ ] Shows 🎁 emoji and "Trial Active"
- [ ] Displays days remaining
- [ ] Shows PNG export counter (X/5)
- [ ] Shows diagram counter (X/3)
- [ ] Has "Upgrade Now" button
- [ ] Updates in real-time after actions

### Upgrade Modal
- [ ] Centers on screen with backdrop
- [ ] Shows 3 plan cards side-by-side
- [ ] Professional plan has "Most Popular" badge
- [ ] Pricing shows both USD and INR
- [ ] Upgrade buttons work correctly
- [ ] Close button (X) dismisses modal

### Boundary Dropdown Fix
- [ ] Dropdown appears below control panel
- [ ] Back buttons remain clickable
- [ ] No visual overlap
- [ ] Correct z-index hierarchy maintained

---

## ✅ Success Criteria

All tests pass when:

1. ✅ **Trial auto-starts** on signup with 7-day period
2. ✅ **PNG exports limited** to 5 with counter
3. ✅ **Diagrams limited** to 3 with counter
4. ✅ **All other exports blocked** immediately
5. ✅ **Trial banner updates** in real-time
6. ✅ **Upgrade modal appears** correctly for blocked features
7. ✅ **Grace period works** after trial expiration
8. ✅ **Boundary dropdown** doesn't overlap control panel buttons

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Configure Stripe Products**
   - Create Professional plan: $49/month + ₹4,099/month
   - Create Enterprise plan: $199/month + ₹16,649/month
   - Copy Price IDs to `.env`

2. **Deploy to Azure Static Web Apps**
   ```bash
   git add .
   git commit -m "Trial system complete and tested"
   git push
   ```

3. **Configure Azure Environment Variables**
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - FRONTEND_URL
   - Price IDs (4 total: USD + INR for each plan)

4. **Setup Stripe Webhooks**
   - Add webhook endpoint: `https://your-site.azurestaticapps.net/api/webhook`
   - Select events: subscription.*, invoice.*, checkout.session.completed

5. **Test Production Payment Flow**
   - Use test card: 4242 4242 4242 4242
   - Verify subscription activation
   - Confirm trial → paid upgrade

---

## 📞 Support

If you encounter any issues:

1. Check browser console for errors (F12 → Console)
2. Verify both dev servers are running
3. Clear localStorage and test with fresh signup
4. Review z-index values for boundary dropdown
5. Check trial status in browser console

**Everything is ready! Start testing now! 🎉**
