# Stripe Payment Integration - Complete Setup Guide

## 📋 Overview

Your Azure Architecture Designer now has **real Stripe payment integration** with:
- ✅ Secure backend API server
- ✅ Stripe Checkout integration
- ✅ Payment verification
- ✅ Subscription management
- ✅ Webhook support

---

## 🚀 Quick Start

### 1. Get Your Stripe API Keys

1. **Create a Stripe account** (if you don't have one):
   - Go to https://dashboard.stripe.com/register
   
2. **Get your API keys**:
   - Navigate to: https://dashboard.stripe.com/apikeys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Create Products and Prices**:
   - Go to: https://dashboard.stripe.com/products
   - Create two products:
     - **Professional Plan**: $49/month recurring
     - **Enterprise Plan**: $199/month recurring
   - Copy the **Price IDs** (start with `price_`)

### 2. Configure Environment Variables

Edit your `.env` file with your actual Stripe keys:

```bash
# Frontend - Publishable Key (safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Backend - Secret Key (KEEP SECRET!)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Stripe Price IDs (from Stripe Dashboard)
VITE_STRIPE_PRICE_PROFESSIONAL=price_YOUR_PROFESSIONAL_ID
VITE_STRIPE_PRICE_ENTERPRISE=price_YOUR_ENTERPRISE_ID

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment-success
VITE_PAYMENT_CANCEL_URL=http://localhost:5173/payment
```

### 3. Start the Application

**Option A: Run both servers together** (Recommended):
```bash
npm run dev:all
```

**Option B: Run servers separately**:

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

### 4. Test the Payment Flow

1. Open your app: http://localhost:5173
2. Click "Get Started" on Professional or Enterprise plan
3. Fill in contact information
4. Click "Proceed to Payment"
5. You'll be redirected to Stripe's secure checkout
6. Use Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date, any CVC, any ZIP

---

## 📁 Project Structure

```
├── server.js                      # Stripe backend server
├── .env                           # Environment variables (SECRET!)
├── .env.example                   # Example env file
├── src/
│   ├── services/
│   │   └── stripeService.js      # Frontend Stripe integration
│   ├── pages/
│   │   ├── PaymentPage.jsx       # Payment form
│   │   └── PaymentSuccess.jsx    # Success confirmation
│   └── ...
└── package.json                   # Updated with new scripts
```

---

## 🔑 API Endpoints

The backend server (`server.js`) provides:

### Health Check
```
GET http://localhost:3001/health
```

### Create Checkout Session
```
POST http://localhost:3001/create-checkout-session
Body: {
  "priceId": "price_xxx",
  "customerEmail": "user@example.com",
  "customerName": "John Doe"
}
```

### Verify Checkout Session
```
GET http://localhost:3001/checkout-session/:sessionId
```

### Create Portal Session (for subscription management)
```
POST http://localhost:3001/create-portal-session
Body: {
  "customerId": "cus_xxx"
}
```

### Webhook Handler
```
POST http://localhost:3001/webhook
```

---

## 🎣 Setting Up Webhooks (Production)

Webhooks notify your server about payment events:

### Local Development (using Stripe CLI):

1. **Install Stripe CLI**:
   ```bash
   # Windows (PowerShell as Admin)
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3001/webhook
   ```

4. **Copy the webhook secret** (starts with `whsec_`) and add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### Production Deployment:

1. Deploy your backend server to a public URL
2. Go to: https://dashboard.stripe.com/webhooks
3. Click "Add endpoint"
4. Enter your webhook URL: `https://yourapp.com/webhook`
5. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the signing secret and add to production `.env`

---

## 🧪 Testing with Stripe Test Cards

Use these test cards in Stripe Checkout:

| Card Number          | Scenario                    |
|---------------------|----------------------------|
| 4242 4242 4242 4242 | Payment succeeds           |
| 4000 0000 0000 0002 | Payment declined           |
| 4000 0027 6000 3184 | Requires authentication     |
| 4000 0000 0000 9995 | Payment declined (insufficient funds) |

- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any 5-digit ZIP code (e.g., 12345)

---

## 🔒 Security Best Practices

✅ **DO**:
- Keep `.env` file in `.gitignore` (already configured)
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Verify webhook signatures (implemented)
- Use HTTPS in production
- Validate all user inputs

❌ **DON'T**:
- Never expose secret keys in frontend code
- Don't skip webhook signature verification
- Don't store card details on your servers

---

## 🚀 Deployment Checklist

### Backend Deployment:

1. **Choose a hosting provider**:
   - Heroku
   - Azure App Service
   - AWS EC2/Lambda
   - DigitalOcean
   - Railway

2. **Set environment variables** on your hosting platform

3. **Deploy backend server**:
   ```bash
   # Example for Heroku
   heroku create your-app-backend
   heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
   git push heroku main
   ```

4. **Update frontend environment**:
   ```bash
   # Update .env or Azure Static Web Apps config
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

5. **Switch to production keys** (from Stripe Dashboard)

6. **Set up webhook endpoint** with your production URL

### Frontend Deployment (Azure Static Web Apps):

1. Update `stripeService.js` with production backend URL:
   ```javascript
   const API_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-backend.herokuapp.com'
     : 'http://localhost:3001';
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Azure Static Web Apps will deploy automatically
   ```

---

## 📊 Monitoring Payments

### Stripe Dashboard:
- View all payments: https://dashboard.stripe.com/payments
- View subscriptions: https://dashboard.stripe.com/subscriptions
- View customers: https://dashboard.stripe.com/customers
- View events: https://dashboard.stripe.com/events

### Webhook Logs:
- Check webhook deliveries: https://dashboard.stripe.com/webhooks
- View failed deliveries and retry

---

## 🛠️ Troubleshooting

### "Payment server is not responding"
**Solution**: Make sure backend server is running:
```bash
npm run server
```

### "Stripe failed to load"
**Solution**: Check `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`

### "Failed to create checkout session"
**Solution**: 
1. Verify backend server is running
2. Check `STRIPE_SECRET_KEY` in `.env`
3. Verify Price IDs are correct

### Webhook signature verification failed
**Solution**: 
1. Get webhook secret from Stripe CLI or Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in `.env`
3. Restart backend server

---

## 📈 Next Steps

### Enhance Payment Flow:
1. **Add proration** for plan upgrades/downgrades
2. **Implement coupon codes** (already supported in checkout)
3. **Add trial periods** for new subscribers
4. **Send custom emails** after successful payment
5. **Store subscription data** in a database
6. **Add billing portal** for customers to manage subscriptions

### Example: Customer Portal Integration

```javascript
import { createPortalSession } from '../services/stripeService';

// Let customers manage their subscription
const handleManageSubscription = async () => {
  const customerId = 'cus_xxx'; // Get from your database
  const portalUrl = await createPortalSession(customerId);
  window.location.href = portalUrl;
};
```

---

## 💡 Tips

- **Test mode**: All test keys start with `test`, live keys with `live`
- **View test data**: Toggle "Test mode" in Stripe Dashboard top-right
- **Disputes**: Use test card `4000000000000259` to simulate disputes
- **Refunds**: Process refunds directly from Stripe Dashboard
- **Analytics**: Stripe provides built-in revenue analytics

---

## 📞 Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli

---

## ✅ Verification Checklist

Before going live:

- [ ] Stripe account verified
- [ ] Production API keys obtained
- [ ] Products and prices created in Stripe
- [ ] Backend server deployed
- [ ] Frontend deployed
- [ ] Environment variables configured
- [ ] Webhooks configured and tested
- [ ] Test payment completed successfully
- [ ] SSL/HTTPS enabled
- [ ] Error handling tested
- [ ] Payment confirmation emails working

---

🎉 **Congratulations!** Your Stripe integration is ready for production!
