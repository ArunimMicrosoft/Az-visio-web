# 🚀 Stripe Setup - No Business Required!

## ✅ You Can Start Testing RIGHT NOW

Stripe **DOES NOT** require business verification for **Test Mode**. You can test payments indefinitely without providing ANY business information.

---

## 📋 Quick Setup (5 Minutes)

### Step 1: Get Your Test API Keys

1. **Go to**: https://dashboard.stripe.com/test/apikeys
2. **If asked to log in**: Use your personal email
3. **Make sure "Test Mode" toggle is ON** (top right)
4. **Copy these 2 keys**:

   **Publishable Key** (starts with `pk_test_`):
   ```
   pk_test_51ABC123DEF456GHI789JKL...
   ```
   
   **Secret Key** (click "Reveal" button, starts with `sk_test_`):
   ```
   sk_test_51XYZ789ABC123DEF456GHI...
   ```

---

### Step 2: Update `.env` File

1. **Open**: `.env` in your project root
2. **Replace** the placeholder keys:

```bash
# Replace these lines:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# With your actual keys:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456GHI789JKL...
STRIPE_SECRET_KEY=sk_test_51XYZ789ABC123DEF456GHI...
```

3. **Save** the file

---

### Step 3: Create Test Products (Optional - But Recommended)

Even in test mode, you need Price IDs. Here's how to create them:

#### 3.1 Create Professional Plan

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Professional Plan`
   - **Description**: `Unlimited Azure architecture diagrams`
   - **Price**: `49.00`
   - **Billing**: `Recurring` → `Monthly`
   - **Currency**: `USD`
4. Click **"Add product"**
5. **Copy the Price ID**: `price_1ABC123...`

#### 3.2 Create Enterprise Plan

1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: `Enterprise Plan`
   - **Description**: `Premium features + support`
   - **Price**: `199.00`
   - **Billing**: `Recurring` → `Monthly`
   - **Currency**: `USD`
3. Click **"Add product"**
4. **Copy the Price ID**: `price_1XYZ789...`

#### 3.3 Update `.env` with Price IDs

```bash
VITE_STRIPE_PRICE_PROFESSIONAL=price_1ABC123...
VITE_STRIPE_PRICE_ENTERPRISE=price_1XYZ789...
```

---

### Step 4: Start Testing!

#### 4.1 Start Backend API
```powershell
cd api
npm install
func start
```

**Expected output:**
```
Functions:
  CreateCheckoutSession: [POST] http://localhost:7071/api/create-checkout-session
  Health: [GET] http://localhost:7071/api/health
```

#### 4.2 Start Frontend (New Terminal)
```powershell
npm run dev
```

**Expected output:**
```
VITE ready in 1000ms
Local: http://localhost:5173/
```

#### 4.3 Test Payment Flow

1. **Open**: http://localhost:5173
2. **Sign up** for trial account
3. **Click** "Upgrade Now"
4. **Select** Professional plan
5. **Use Stripe test card**:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/34` (any future date)
   - **CVC**: `123` (any 3 digits)
   - **ZIP**: `12345` (any 5 digits)
6. **Click** "Subscribe"
7. ✅ **Success!** You should see payment success page

---

## 🎯 Test Mode vs Live Mode

### Test Mode (Current - No Verification Needed)
- ✅ Works immediately
- ✅ No business info required
- ✅ Use test cards (4242 4242 4242 4242)
- ✅ No real money charged
- ✅ Perfect for development
- ✅ Keys start with `pk_test_` and `sk_test_`

### Live Mode (Later - When Ready to Accept Real Payments)
- ⚠️ Requires business verification
- ⚠️ Need bank account for payouts
- ⚠️ Need tax information (SSN/EIN)
- ⚠️ Takes 1-2 days for approval
- ✅ Real credit cards work
- ✅ Real money charged
- ✅ Keys start with `pk_live_` and `sk_live_`

---

## 🔥 Common Issues & Solutions

### Issue: "No such price: price_xxxxx"
**Solution**: You need to create products in Stripe Dashboard (see Step 3)

### Issue: "Invalid API key provided"
**Solution**: 
1. Make sure you copied the FULL key (starts with `pk_test_` or `sk_test_`)
2. Make sure there's no space before/after the key in `.env`
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "Stripe is not defined"
**Solution**: 
1. Install Stripe packages: `npm install @stripe/stripe-js stripe`
2. In `api` folder: `cd api && npm install stripe @azure/functions`

### Issue: Can't find Stripe Dashboard
**Direct Links**:
- Test API Keys: https://dashboard.stripe.com/test/apikeys
- Test Products: https://dashboard.stripe.com/test/products
- Test Payments: https://dashboard.stripe.com/test/payments

---

## 🎉 You're Ready!

Once you:
1. ✅ Copy test API keys from Stripe Dashboard
2. ✅ Paste them in `.env` file
3. ✅ Create 2 test products (Professional & Enterprise)
4. ✅ Start backend (`cd api && func start`)
5. ✅ Start frontend (`npm run dev`)

**You can test payments without ANY business verification!**

---

## 📞 Next Steps

### For Testing (Now):
- Use test mode indefinitely
- Test all payment flows
- Verify trial system works
- Test webhooks locally

### For Production (Later):
- Complete Stripe business verification
- Provide tax information
- Add bank account
- Switch to live API keys
- Update Azure environment variables

---

## 🆘 Still Can't Access Test Keys?

If Stripe is blocking you from accessing test keys:

1. **Try incognito/private window**: Sometimes cookies cause issues
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Try different browser**: Chrome, Firefox, Edge
4. **Contact Stripe support**: https://support.stripe.com/contact
5. **Or use this workaround**: Create a brand new Stripe account with different email

**Remember**: You do NOT need business info for Test Mode! If it's asking, just skip/close those prompts.

---

**Updated**: March 8, 2026
**Time to Complete**: 5-10 minutes
**Cost**: $0 (test mode is free forever)
