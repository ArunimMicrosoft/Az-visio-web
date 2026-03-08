# 🎁 Trial System Testing Checklist

## Current Status: ✅ READY FOR TESTING

The trial system has been fully implemented. Follow this checklist to verify everything works.

---

## ✅ What's Implemented

### 1. **Auto-Trial on Signup**
- New users automatically get 7-day trial
- Trial fields added to user model:
  - `subscriptionTier: 'trial'`
  - `trialStartDate`
  - `trialExpiresAt`
  - `trialExportsUsed: 0`
  - `diagramsCreated: 0`

### 2. **Trial Banner Component**
- Shows at top of app when user is on trial
- Real-time countdown (days remaining)
- Displays: "🎁 Trial Active - 7 days • 5/5 PNG exports • 3/3 diagrams"
- "Upgrade Now" button navigates to payment page
- Grace period warning (⚠️) after expiration

### 3. **PNG Export Limit (5 exports)**
- Counter decrements: "4 exports remaining", "3 exports remaining", etc.
- Confirmation dialog shows remaining count
- After 5th export, upgrade modal appears
- Usage tracked in localStorage and user database

### 4. **Diagram Creation Limit (3 diagrams)**
- Tracks when user creates/clears diagrams
- After 3rd diagram, upgrade modal appears
- Limited to 3 total diagrams during trial

### 5. **Blocked Premium Exports**
All these show upgrade modal immediately:
- ❌ SVG Export
- ❌ PDF Export  
- ❌ JSON Export
- ❌ Terraform Export
- ❌ ARM Template Export
- ❌ Cost Report Export

### 6. **Grace Period (2 days)**
- After 7 days, user gets 2 extra days
- Banner shows: "⚠️ Grace Period - Your trial has expired"
- PNG exports still blocked, but app still accessible
- After grace period ends, all features locked

### 7. **Upgrade Modal**
- Shows plan comparison (Starter/Professional/Enterprise)
- Explains which feature is blocked
- "Choose Plan" buttons link to payment page

---

## 🧪 Test Procedures

### **Test 1: Sign Up & Auto-Trial** ✅

1. **Open app**: http://localhost:5173
2. Click "Get Started" or "Sign In"
3. Click "Create Account" tab
4. Fill in:
   - Email: `trial-test@example.com`
   - Name: `Test User`
   - Password: `Test123!@#`
5. Click "Create Account"

**✅ Expected Result:**
- Successfully signed up
- Redirected to main app
- **Trial banner appears at top**: "🎁 Trial Active - 7 days • 5/5 PNG exports • 3/3 diagrams"
- No errors in browser console

**📸 What to Look For:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎁 Trial Active  7 days • 5/5 PNG exports • 3/3 diagrams │ [Upgrade Now]
└─────────────────────────────────────────────────────────┘
```

---

### **Test 2: PNG Export Limit (5 exports)** ✅

1. **Create a simple diagram:**
   - Drag 2-3 Azure services onto canvas (e.g., VM, Storage, Database)
   
2. **Export as PNG (1st time):**
   - Click "Export" button → "Export as PNG"
   - Confirm dialog: "PNG Export (4 exports remaining after this)"
   - Click OK
   
3. **Verify:**
   - PNG downloads successfully
   - Trial banner updates: "4/5 PNG exports"

4. **Repeat 3 more times** (2nd, 3rd, 4th exports)
   - Each time, counter decrements: "3/5", "2/5", "1/5"

5. **5th Export:**
   - Dialog shows: "0 exports remaining after this"
   - PNG downloads

6. **6th Export (should fail):**
   - Click "Export" → "Export as PNG"
   - **Upgrade modal appears** with message:
     ```
     PNG export limit reached (5/5)
     Upgrade for unlimited exports
     ```

**✅ Expected Result:**
- First 5 exports work
- 6th export blocked
- Upgrade modal shows with plan comparison

---

### **Test 3: Diagram Creation Limit (3 diagrams)** ✅

1. **Create diagram 1:**
   - Drag some services onto canvas
   - Save or work with it

2. **Clear canvas (creates new diagram):**
   - Click "Clear Canvas" button
   - Confirm the clear action
   - **Counter decrements**: "2/3 diagrams"

3. **Repeat 2 more times:**
   - Add services, clear again (2nd diagram)
   - Add services, clear again (3rd diagram)

4. **4th diagram (should fail):**
   - Try to clear canvas again
   - **Upgrade modal appears**:
     ```
     Diagram limit reached (3/3)
     Upgrade for unlimited diagrams
     ```

**✅ Expected Result:**
- First 3 diagram creations work
- 4th creation blocked with upgrade prompt

---

### **Test 4: Blocked Premium Exports** ✅

Try each export type. ALL should immediately show upgrade modal:

1. **SVG Export:**
   - Click "Export" → "Export as SVG"
   - **Upgrade modal appears**: "SVG Export requires upgrade"

2. **PDF Export:**
   - Click "Export" → "Export as PDF"
   - **Upgrade modal appears**: "PDF Export requires upgrade"

3. **JSON Export:**
   - Click "Export" → "Export as JSON"
   - **Upgrade modal appears**: "JSON Export requires upgrade"

4. **Terraform Export:**
   - Click "Export" → "Export as Terraform"
   - **Upgrade modal appears**: "Terraform Export requires upgrade"

5. **ARM Template:**
   - Click "Export" → "Export ARM Template"
   - **Upgrade modal appears**: "ARM Template Export requires upgrade"

6. **Cost Report:**
   - Click "Cost Summary" → "Export Cost Report"
   - **Upgrade modal appears**: "Cost Report Export requires upgrade"

**✅ Expected Result:**
- All 6 export types blocked immediately
- Upgrade modal shows for each
- No exports actually happen

---

### **Test 5: Trial Status in Browser Console** 🔍

1. **Open Browser DevTools:**
   - Press `F12`
   - Go to "Console" tab

2. **Check console logs:**
   - Look for trial-related logs:
     ```
     🎁 TrialBanner - User: {id: "user_...", subscriptionTier: "trial", ...}
     🎁 TrialBanner - Trial Status: {isTrial: true, daysRemaining: 7, ...}
     ```

3. **Check localStorage:**
   - In Console, type:
     ```javascript
     JSON.parse(localStorage.getItem('azureDesigner_user'))
     ```
   - Verify output shows:
     ```javascript
     {
       subscriptionTier: "trial",
       trialStartDate: "2026-03-08T...",
       trialExpiresAt: "2026-03-15T...",
       trialExportsUsed: 0,  // or higher after exports
       diagramsCreated: 0     // or higher after clears
     }
     ```

**✅ Expected Result:**
- Console logs show trial status
- localStorage has correct trial fields
- Dates are 7 days apart

---

### **Test 6: Upgrade Flow** 💳

1. **Click "Upgrade Now" in trial banner**
   - Should navigate to `/payment?plan=professional`

2. **Verify Payment Page:**
   - Shows 3 plans (Starter/Professional/Enterprise)
   - Professional plan pre-selected
   - Shows USD and INR pricing

3. **Click "Choose Plan" on Professional:**
   - Should proceed to checkout form
   - (Note: Stripe not configured yet, so actual payment won't work)

**✅ Expected Result:**
- Upgrade button navigates correctly
- Payment page loads
- Plan selection works

---

### **Test 7: Manual Trial Expiration Test** ⏰

**Warning:** This modifies your user data. Only do this if you want to test expiration.

1. **Open Browser Console** (F12)

2. **Manually expire trial:**
   ```javascript
   // Get current user
   let user = JSON.parse(localStorage.getItem('azureDesigner_user'));
   
   // Set trial to expire yesterday (grace period active)
   user.trialExpiresAt = new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString();
   
   // Save back
   localStorage.setItem('azureDesigner_user', JSON.stringify(user));
   
   // Reload page
   location.reload();
   ```

3. **Check Banner:**
   - Should show: "⚠️ Grace Period - Your trial has expired. Upgrade now to continue."

4. **Try PNG Export:**
   - Should be **blocked** with upgrade modal

5. **Expire grace period too:**
   ```javascript
   let user = JSON.parse(localStorage.getItem('azureDesigner_user'));
   user.trialExpiresAt = new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString();
   localStorage.setItem('azureDesigner_user', JSON.stringify(user));
   location.reload();
   ```

6. **Check App:**
   - Banner should disappear (hard expired)
   - All features locked

**✅ Expected Result:**
- Grace period shows warning
- Hard expiration locks all features

---

## 🐛 Debugging

### If Trial Banner Doesn't Show:

1. **Check user data:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('azureDesigner_user')));
   ```
   - Verify `subscriptionTier: "trial"`

2. **Check console logs:**
   - Look for `🎁 TrialBanner` logs
   - Check for errors

3. **Try clearing cache:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```
   - Sign up again

### If Export Limits Don't Work:

1. **Check counter in banner:**
   - Should update after each export

2. **Check localStorage:**
   ```javascript
   let user = JSON.parse(localStorage.getItem('azureDesigner_user'));
   console.log('Exports:', user.trialExportsUsed);
   console.log('Diagrams:', user.diagramsCreated);
   ```

3. **Check console for errors:**
   - Look for `canExportPNG`, `recordPNGExport` errors

---

## 📊 Trial System Architecture

```
User Signs Up
     ↓
Auto-assigned "trial" tier
     ↓
Trial expires in 7 days
     ↓
┌─────────────────────────┐
│   Trial Limitations:    │
│  • 5 PNG exports max    │
│  • 3 diagrams max       │
│  • Premium exports OFF  │
└─────────────────────────┘
     ↓
After 7 days → Grace Period (2 days)
     ↓
After 9 days → Hard Expiration (all features locked)
```

---

## 📁 Key Files

### Components:
- `src/components/TrialBanner.jsx` - Trial status banner
- `src/components/TrialBanner.css` - Banner styling
- `src/components/UpgradeModal.jsx` - Upgrade prompt modal
- `src/components/UpgradeModal.css` - Modal styling

### Logic:
- `src/utils/authSecurity.js` - Trial functions:
  - `getTrialStatus()` - Check trial status
  - `canExportPNG()` - Validate PNG export
  - `canCreateDiagram()` - Validate diagram creation
  - `recordPNGExport()` - Track PNG usage
  - `recordDiagramCreation()` - Track diagram usage
  - `upgradeToPaid()` - Upgrade user tier

### Integration:
- `src/App.jsx` - Trial checks in all export handlers

---

## ✅ Confirmation Checklist

Mark each as you test:

- [ ] Trial banner shows on new signup
- [ ] Banner shows correct days remaining (7)
- [ ] Banner shows correct export count (5/5)
- [ ] Banner shows correct diagram count (3/3)
- [ ] PNG export works for first 5 times
- [ ] PNG export counter decrements correctly
- [ ] 6th PNG export blocked with modal
- [ ] SVG export blocked immediately
- [ ] PDF export blocked immediately
- [ ] JSON export blocked immediately
- [ ] Terraform export blocked immediately
- [ ] ARM export blocked immediately
- [ ] Cost report export blocked immediately
- [ ] Diagram limit works (3 max)
- [ ] Upgrade button navigates to payment page
- [ ] Upgrade modal shows plan comparison
- [ ] Trial data persists in localStorage
- [ ] Console shows correct trial logs
- [ ] Grace period warning appears after 7 days
- [ ] Hard expiration locks all features

---

## 🎉 Success Criteria

**Trial system is WORKING if:**
1. ✅ New users automatically get 7-day trial
2. ✅ Trial banner appears and updates in real-time
3. ✅ PNG exports limited to 5 with counter
4. ✅ Diagrams limited to 3
5. ✅ Premium exports blocked with upgrade modal
6. ✅ Upgrade flow navigates to payment page
7. ✅ Trial data persists across sessions
8. ✅ Grace period and expiration work correctly

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Mark trial system as ✅ COMPLETE
   - Move to Stripe product configuration
   - Set up Azure Functions backend
   - Configure webhooks

2. **If tests fail:**
   - Note which test failed
   - Check browser console for errors
   - Review implementation in failed component
   - Fix and re-test

---

## 📞 Quick Test Commands

**Open app:**
```
http://localhost:5173
```

**Check user data:**
```javascript
JSON.parse(localStorage.getItem('azureDesigner_user'))
```

**Check trial status:**
```javascript
const { getTrialStatus } = await import('./src/utils/authSecurity.js');
const user = JSON.parse(localStorage.getItem('azureDesigner_user'));
getTrialStatus(user);
```

**Reset trial (start fresh):**
```javascript
localStorage.clear();
location.reload();
```

---

**Last Updated:** March 8, 2026  
**Status:** ✅ Ready for Testing  
**Estimated Test Time:** 15-20 minutes
