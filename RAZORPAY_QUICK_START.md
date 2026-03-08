# 🚀 Razorpay Quick Start Guide (India)

## ✅ Current Status: KYC Under Review

**Good News:** You can start testing immediately while KYC is being reviewed!

---

## 📋 Step 1: Get Test API Keys (Available NOW)

### 1.1 Access Test Mode
1. Go to: https://dashboard.razorpay.com
2. **Toggle to "Test Mode"** (top-left or top-right switch)
3. You should see "Test Mode" indicator

### 1.2 Generate Test Keys
1. Click **Settings** → **API Keys**
2. Or go directly to: https://dashboard.razorpay.com/app/keys
3. Click **"Generate Test Key"** (if not already generated)
4. You'll see two keys:

**Key ID** (Public - Safe to expose):
```
rzp_test_ABC123XYZ456
```

**Key Secret** (Private - KEEP SECRET):
```
rzp_test_SECRET789ABC456
```

### 1.3 Update `.env` File

Open `.env` and paste your keys:

```bash
# Razorpay Test Keys (Replace with your actual keys)
VITE_RAZORPAY_KEY_ID=rzp_test_ABC123XYZ456
RAZORPAY_KEY_SECRET=rzp_test_SECRET789ABC456

# URLs
FRONTEND_URL=http://localhost:5173
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment-success
VITE_PAYMENT_CANCEL_URL=http://localhost:5173/payment
```

---

## 📦 Step 2: Install Razorpay Package

```powershell
# Install Razorpay SDK
npm install razorpay
```

---

## 🧪 Step 3: Test Payment Flow

### 3.1 Start Dev Server
```powershell
npm run dev
```

### 3.2 Test with Test Card
When making a payment, use these test cards:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: `123`
- Expiry: Any future date

---

## 🎯 Test Mode vs Live Mode

### Test Mode (Current - No KYC Needed)
- ✅ Available immediately
- ✅ No KYC required
- ✅ Use test cards
- ✅ No real money charged
- ✅ Keys start with `rzp_test_`

### Live Mode (After KYC Approval)
- ⏳ Requires KYC approval (1-3 days)
- ✅ Real credit cards work
- ✅ Real money charged
- ✅ Keys start with `rzp_live_`

---

## 📊 Create Subscription Plans

### In Razorpay Dashboard:

1. Go to: **Subscriptions** → **Plans**
2. Click **"Create Plan"**

#### Professional Plan (₹4,099/month)
- **Plan Name**: `Professional`
- **Billing Frequency**: `Monthly`
- **Amount**: `409900` (in paise, so ₹4,099)
- **Currency**: `INR`
- Click **"Create"**
- **Copy Plan ID**: `plan_ABC123XYZ`

#### Enterprise Plan (₹16,649/month)
- **Plan Name**: `Enterprise`
- **Billing Frequency**: `Monthly`
- **Amount**: `1664900` (in paise, so ₹16,649)
- **Currency**: `INR`
- Click **"Create"**
- **Copy Plan ID**: `plan_XYZ789ABC`

### Update `.env` with Plan IDs:
```bash
VITE_RAZORPAY_PLAN_PROFESSIONAL=plan_ABC123XYZ
VITE_RAZORPAY_PLAN_ENTERPRISE=plan_XYZ789ABC
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git**
   ```bash
   # Make sure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Keep Key Secret private** - Never expose in frontend code

3. **Use webhooks** to verify payment status server-side

---

## 🆘 KYC Under Review

### What's Being Reviewed?
- Business/Individual verification
- Bank account details
- Identity documents

### How Long?
- Usually **1-3 business days**
- Sometimes up to **7 days**

### What to Do While Waiting?
1. ✅ Use Test Mode for development
2. ✅ Build and test your payment flow
3. ✅ Integrate Razorpay SDK
4. ✅ Test all features
5. ⏳ Wait for KYC approval email

### After KYC Approval:
1. Switch to **Live Mode**
2. Generate **Live API Keys**
3. Update `.env` with live keys
4. Deploy to production
5. Accept real payments! 🎉

---

## 💳 Test Card Numbers

| Card Type | Card Number | Result |
|-----------|-------------|--------|
| Visa (Success) | `4111 1111 1111 1111` | ✅ Payment Success |
| Mastercard (Success) | `5555 5555 5555 4444` | ✅ Payment Success |
| Failure Card | `4000 0000 0000 0002` | ❌ Payment Failed |
| Insufficient Funds | `4000 0000 0000 9995` | ❌ Insufficient Funds |

**For all test cards:**
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/28`)

---

## 🚀 Quick Test Checklist

- [ ] Test Mode enabled in dashboard
- [ ] Test API keys copied to `.env`
- [ ] Razorpay package installed (`npm install razorpay`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access payment page
- [ ] Test card payment works
- [ ] Payment success page appears
- [ ] Waiting for KYC approval

---

## 📞 Need Help?

**Razorpay Support:**
- Dashboard: https://dashboard.razorpay.com/app/dashboard
- Support: https://razorpay.com/support/
- Docs: https://razorpay.com/docs/

**Check KYC Status:**
- Dashboard → Settings → Business Settings → KYC Status

---

**Last Updated:** March 8, 2026  
**Status:** KYC Under Review - Test Mode Active  
**Time to Go Live:** 1-7 days after KYC approval
