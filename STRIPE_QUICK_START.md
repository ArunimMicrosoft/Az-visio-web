# 🎯 Stripe Integration - Quick Reference

## Start the App
```bash
npm run dev:all     # Run both frontend + backend
```

## Test Payment
1. Go to http://localhost:5173
2. Click pricing plan "Get Started"
3. Fill email and name
4. Click "Proceed to Payment"
5. Use test card: **4242 4242 4242 4242**
6. Any expiry/CVC/ZIP

## Environment Setup
```bash
# .env file
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
VITE_STRIPE_PRICE_PROFESSIONAL=price_xxx
VITE_STRIPE_PRICE_ENTERPRISE=price_xxx
```

## Get Stripe Keys
1. https://dashboard.stripe.com/apikeys
2. https://dashboard.stripe.com/products (create prices)

## Test Cards
- ✅ Success: `4242 4242 4242 4242`
- ❌ Decline: `4000 0000 0000 0002`

## Servers
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health: http://localhost:3001/health

## Troubleshooting
- "Server offline": Run `npm run server`
- "Stripe failed": Check publishable key
- "Session failed": Check secret key and price IDs

## Full Guide
See `STRIPE_SETUP_GUIDE.md` for complete documentation.
