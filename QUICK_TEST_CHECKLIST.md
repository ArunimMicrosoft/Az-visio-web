# 🎯 Trial System Quick Test Checklist

## ⚡ 5-Minute Quick Test

### 🚀 Before You Start
- [ ] Frontend running at http://localhost:5173 ✅ (Already Running)
- [ ] Open new terminal and run: `cd api && func start`
- [ ] Wait for "Host started" message

---

## 📋 Test 1: Sign Up (30 seconds)

1. Open http://localhost:5173
2. Click "Sign In" → "Don't have an account? Sign up"
3. Enter:
   - Email: `test-trial@example.com`
   - Password: `Test123!`
   - Name: `Trial Tester`
4. Click "Sign Up"

**✅ Pass Criteria:**
```
You should see at the top:
┌─────────────────────────────────────────────────────┐
│ 🎁 Trial Active | 7 days • 5/5 PNG exports • 3/3...│
└─────────────────────────────────────────────────────┘
```

---

## 📋 Test 2: PNG Export Counter (1 minute)

1. Drag 2-3 Azure services onto canvas
2. Click "Export" → "Export as PNG"
3. **Look for confirmation dialog:**
   ```
   PNG Export (4 exports remaining after this)
   Click OK to continue or Cancel to upgrade.
   ```
4. Click OK
5. **Check banner:** Should now show `4/5 PNG exports`
6. Repeat 2 more times
7. **Banner should show:** `2/5 PNG exports`

**✅ Pass Criteria:**
- Export counter decrements: 5→4→3→2→1
- PNG downloads successfully
- Banner updates in real-time

---

## 📋 Test 3: Blocked Exports (1 minute)

1. Try "Export as SVG"

**✅ Pass Criteria:**
```
Upgrade modal appears immediately:
┌──────────────────────────────────────┐
│  Feature Not Available in Trial     │
│                                      │
│  SVG Export requires a paid          │
│  subscription.                       │
│                                      │
│  [Upgrade to Professional]           │
│  [Upgrade to Enterprise]             │
│                                      │
│  [Continue Trial]                    │
└──────────────────────────────────────┘
```

2. Close modal
3. Try these (should ALL show upgrade modal):
   - [ ] Export as PDF
   - [ ] Export as JSON
   - [ ] Export Terraform
   - [ ] Export ARM Template
   - [ ] Generate Cost Report

---

## 📋 Test 4: Boundary Dropdown (30 seconds)

1. Look at Control Panel (left sidebar)
2. Find "Back" buttons at the top
3. Click "Boundary" button (top-center toolbar)
4. Observe dropdown menu

**✅ Pass Criteria:**
- [ ] Dropdown appears BELOW control panel
- [ ] Back buttons are still clickable
- [ ] No overlap between dropdown and buttons
- [ ] Can click any control panel button while dropdown is open

**Visual Check:**
```
        [Boundary ▼]  ← Dropdown here (z-index: 50)
              ↓
┌──────────────────┐
│ Control Panel    │
│ [← Back]         │  ← These stay on top (z-index: 100)
│ [← Components]   │
└──────────────────┘
```

---

## 📋 Test 5: Diagram Limit (1 minute)

1. Add some components to canvas
2. Click "Clear Canvas" → Confirm
3. **Check banner:** `2/3 diagrams`
4. Add more components
5. Clear again
6. **Check banner:** `1/3 diagrams`
7. Clear again
8. **Check banner:** `0/3 diagrams`
9. Try to clear ONE MORE TIME

**✅ Pass Criteria:**
```
Upgrade modal appears:
┌──────────────────────────────────────┐
│  Trial Limit Reached                 │
│                                      │
│  You've created 3 diagrams in your   │
│  trial. Upgrade to create unlimited  │
│  diagrams.                           │
└──────────────────────────────────────┘
```

---

## 🎯 All Tests Complete!

### ✅ If All Tests Pass:

You should have seen:
1. ✅ Trial banner with live counters
2. ✅ PNG exports work but are limited (5 total)
3. ✅ All other exports blocked with upgrade prompt
4. ✅ Boundary dropdown stays below control panel
5. ✅ Diagram creation limited to 3
6. ✅ Upgrade modal shows on all limits/blocks

### ❌ If Any Test Fails:

**Check browser console (F12):**
```javascript
// Get user data
const session = JSON.parse(localStorage.getItem('currentSession'));
const users = JSON.parse(localStorage.getItem('users'));
const user = users?.find(u => u.id === session?.userId);
console.log('User:', user);
console.log('Tier:', user?.subscriptionTier);
console.log('PNG Exports:', user?.trialExportsUsed);
console.log('Diagrams:', user?.diagramsCreated);
```

**Reset trial for re-testing:**
```javascript
user.trialExportsUsed = 0;
user.diagramsCreated = 0;
localStorage.setItem('users', JSON.stringify([user]));
location.reload();
```

---

## 🔧 Troubleshooting

### Banner Not Showing?
- Check if user is signed in
- Verify subscription tier is "trial"
- Look for banner at very top of canvas area

### Exports Not Blocked?
- Check browser console for errors
- Verify trial system functions imported in App.jsx
- Check user trial status

### Boundary Dropdown Overlaps?
- Inspect z-index values in DevTools
- Canvas Toolbar should be z-index: 50
- Control Panel should be z-index: 100

### Counters Not Updating?
- Check localStorage is updating
- Verify trial functions are recording actions
- Reload page and check if persisted

---

## 📊 Quick Debug Commands

**Open browser console (F12) and paste:**

```javascript
// Check trial status
const session = JSON.parse(localStorage.getItem('currentSession'));
const users = JSON.parse(localStorage.getItem('users'));
const user = users?.find(u => u.id === session?.userId);
console.table({
  'Subscription': user?.subscriptionTier,
  'PNG Exports Used': user?.trialExportsUsed,
  'Diagrams Created': user?.diagramsCreated,
  'Trial Expires': new Date(user?.trialExpiresAt).toLocaleDateString(),
  'Days Left': Math.ceil((new Date(user?.trialExpiresAt) - Date.now()) / (24*60*60*1000))
});

// Check z-index values
console.table({
  'Canvas Toolbar': getComputedStyle(document.querySelector('.canvas-toolbar')).zIndex,
  'Control Panel': getComputedStyle(document.querySelector('.control-panel')).zIndex,
  'Boundary Dropdown': getComputedStyle(document.querySelector('.boundary-type-selector-toolbar')).zIndex
});
```

---

## ✨ Success!

If all tests pass, your trial system is **production-ready**! 🎉

**Next Steps:**
1. Configure Stripe products
2. Deploy to Azure
3. Setup webhooks
4. Test payment flow

**See full testing guide:** `TRIAL_SYSTEM_TESTING_GUIDE.md`
