# 🏗️ Stripe Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Azure Architecture Designer                   │
│                    (React + Vite Frontend)                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ User clicks
                               │ "Get Started"
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PaymentPage.jsx                           │
│  - Collect email & name                                         │
│  - Select pricing plan                                          │
│  - Check server health                                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Calls
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    stripeService.js                             │
│  - createCheckoutSession(priceId, email, name)                  │
│  - verifyCheckoutSession(sessionId)                             │
│  - createPortalSession(customerId)                              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ POST /create-checkout-session
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Server                             │
│                      (server.js)                                │
│  Express + Stripe SDK                                           │
│  Port: 3001                                                     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Creates session
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Stripe API                               │
│  - Creates Checkout Session                                     │
│  - Returns session URL                                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Redirect
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Stripe Checkout Page                          │
│  (Hosted by Stripe - PCI Compliant)                            │
│  - User enters card details                                     │
│  - Processes payment securely                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                Redirect           Webhook Event
                     │                   │
                     ▼                   ▼
        ┌──────────────────┐   ┌──────────────────┐
        │ PaymentSuccess   │   │  POST /webhook   │
        │     Page         │   │   (server.js)    │
        │                  │   │                  │
        │ - Verify session │   │ - Verify sig     │
        │ - Show details   │   │ - Process event  │
        │ - Auto-redirect  │   │ - Update DB      │
        └──────────────────┘   └──────────────────┘
```

---

## File Structure

```
Az visio web/
│
├── 🔧 Backend
│   ├── server.js                    # Express server + Stripe
│   ├── .env                         # API keys (SECRET!)
│   └── .env.example                 # Template
│
├── 🎨 Frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── stripeService.js     # Stripe SDK wrapper
│   │   │
│   │   └── pages/
│   │       ├── LandingPage.jsx      # Pricing section
│   │       ├── PaymentPage.jsx      # Checkout form
│   │       └── PaymentSuccess.jsx   # Confirmation
│   │
│   └── ...
│
├── 📖 Documentation
│   ├── README_STRIPE.md             # This file
│   ├── STRIPE_SETUP_GUIDE.md        # Complete guide
│   ├── STRIPE_QUICK_START.md        # Quick ref
│   └── STRIPE_INTEGRATION_COMPLETE.md
│
└── 📦 Configuration
    ├── package.json                 # Dependencies + scripts
    └── vite.config.js              # Build config
```

---

## Data Flow Diagram

### 1️⃣ Payment Initiation

```
User Input → Frontend Validation → Backend API → Stripe API
   ↓              ↓                    ↓             ↓
Email/Name    Format check        Secret key     Session ID
Company       Required fields     Price ID       Checkout URL
```

### 2️⃣ Payment Processing

```
Stripe Checkout → User Enters Card → Payment → Success/Failure
      ↓                  ↓              ↓            ↓
  Secure form      Card details      Stripe      Redirect
  Hosted page      CVV/Expiry       processes    to app
```

### 3️⃣ Verification & Fulfillment

```
Redirect → Frontend → Backend → Stripe API → Display
   ↓          ↓          ↓          ↓           ↓
session_id  Verify   GET /session  Return    Success
in URL      payment   /:id         details   message
```

---

## API Endpoints Map

### Frontend → Backend

```
POST /create-checkout-session
├── Input: { priceId, customerEmail, customerName }
├── Auth: None (public endpoint)
├── Returns: { sessionId, url }
└── Use: Initiate payment

GET /checkout-session/:sessionId
├── Input: sessionId in URL
├── Auth: None (validates via Stripe)
├── Returns: { status, customerEmail, amountTotal }
└── Use: Verify payment

POST /create-portal-session
├── Input: { customerId }
├── Auth: Recommended for production
├── Returns: { url }
└── Use: Subscription management

GET /health
├── Input: None
├── Returns: { status: 'ok' }
└── Use: Server health check
```

### Stripe → Backend

```
POST /webhook
├── Input: Stripe event (signed)
├── Headers: stripe-signature
├── Returns: { received: true }
└── Events:
    ├── checkout.session.completed
    ├── customer.subscription.created
    ├── customer.subscription.updated
    ├── customer.subscription.deleted
    ├── invoice.payment_succeeded
    └── invoice.payment_failed
```

---

## Environment Variables Map

### 🎨 Frontend (.env → Vite)

```bash
VITE_STRIPE_PUBLISHABLE_KEY          # Stripe public key
  ↓ Used in: stripeService.js
  ↓ Purpose: Initialize Stripe.js
  ↓ Safe: Yes (can be public)

VITE_STRIPE_PRICE_PROFESSIONAL       # Price ID
  ↓ Used in: PaymentPage.jsx
  ↓ Purpose: Professional plan pricing
  ↓ Safe: Yes (can be public)

VITE_STRIPE_PRICE_ENTERPRISE         # Price ID
  ↓ Used in: PaymentPage.jsx
  ↓ Purpose: Enterprise plan pricing
  ↓ Safe: Yes (can be public)

VITE_STRIPE_BACKEND_URL              # Backend URL
  ↓ Used in: stripeService.js
  ↓ Purpose: API endpoint
  ↓ Safe: Yes (can be public)
  ↓ Default: Auto-detected
```

### 🔧 Backend (.env → Node.js)

```bash
STRIPE_SECRET_KEY                    # Stripe secret key
  ↓ Used in: server.js
  ↓ Purpose: Stripe API authentication
  ↓ Safe: NO! Keep secret!
  ↓ Format: sk_test_... or sk_live_...

STRIPE_WEBHOOK_SECRET                # Webhook signing secret
  ↓ Used in: server.js /webhook
  ↓ Purpose: Verify webhook authenticity
  ↓ Safe: NO! Keep secret!
  ↓ Format: whsec_...

PORT                                 # Server port
  ↓ Used in: server.js
  ↓ Purpose: Backend server port
  ↓ Default: 3001

FRONTEND_URL                         # CORS origin
  ↓ Used in: server.js (CORS config)
  ↓ Purpose: Allow frontend requests
  ↓ Default: http://localhost:5173
```

---

## Security Architecture

### 🔒 Security Layers

```
Layer 1: Frontend Input Validation
  ↓ Email format check
  ↓ Required field validation
  ↓ XSS prevention

Layer 2: HTTPS/SSL
  ↓ Encrypted transport
  ↓ Man-in-the-middle protection
  ↓ Certificate validation

Layer 3: Backend Authentication
  ↓ API key validation
  ↓ CORS configuration
  ↓ Rate limiting ready

Layer 4: Stripe Security
  ↓ PCI DSS Level 1
  ↓ Webhook signature verification
  ↓ No card storage

Layer 5: Environment Protection
  ↓ .env not committed
  ↓ .gitignore configured
  ↓ Secret rotation ready
```

### 🔐 Sensitive Data Handling

```
Card Details:
  ❌ Never sent to your frontend
  ❌ Never sent to your backend
  ✅ Only sent to Stripe (PCI compliant)

Secret Keys:
  ❌ Never in frontend code
  ❌ Never in version control
  ✅ Only in backend .env

API Keys:
  ✅ Publishable key OK in frontend
  ❌ Secret key backend only
  ✅ Webhook secret backend only
```

---

## Payment States Diagram

```
┌─────────────┐
│  IDLE       │  User browsing landing page
└──────┬──────┘
       │ Click "Get Started"
       ▼
┌─────────────┐
│  FORM       │  User enters email/name
└──────┬──────┘
       │ Submit form
       ▼
┌─────────────┐
│  LOADING    │  Creating checkout session
└──────┬──────┘
       │ Session created
       ▼
┌─────────────┐
│  REDIRECT   │  Sending to Stripe
└──────┬──────┘
       │ On Stripe's site
       ▼
┌─────────────┐
│  CHECKOUT   │  User enters card details
└──────┬──────┘
       │ Payment processed
       ▼
┌─────────────┐
│  VERIFYING  │  Confirming payment
└──────┬──────┘
       │ Payment confirmed
       ▼
┌─────────────┐
│  SUCCESS    │  Show confirmation
└──────┬──────┘
       │ After 5 seconds
       ▼
┌─────────────┐
│  APP        │  Redirect to application
└─────────────┘
```

---

## Error Handling Flow

```
Error Detection
       │
       ├─► Frontend Validation Error
       │   └─► Show inline error message
       │       └─► User fixes input
       │
       ├─► Network Error
       │   └─► Show "Server offline" warning
       │       └─► Check backend running
       │
       ├─► Backend Error
       │   └─► Return error response
       │       └─► Show user-friendly message
       │
       ├─► Stripe API Error
       │   └─► Log detailed error
       │       └─► Show generic message
       │
       └─► Payment Declined
           └─► Redirect back with message
               └─► User tries different card
```

---

## Webhook Event Processing

```
Stripe Event → POST /webhook
       │
       ├─► Verify signature
       │   ├─► Valid → Continue
       │   └─► Invalid → Return 400
       │
       ├─► Parse event type
       │
       ├─► checkout.session.completed
       │   └─► Activate subscription
       │       └─► Send welcome email
       │
       ├─► customer.subscription.updated
       │   └─► Update user access
       │       └─► Notify user
       │
       ├─► invoice.payment_failed
       │   └─► Mark subscription at risk
       │       └─► Send reminder email
       │
       └─► Return 200 OK
           └─► Stripe marks as received
```

---

## Development vs Production

### 🧪 Development Mode

```
Frontend:  localhost:5173
Backend:   localhost:3001
Stripe:    Test mode (pk_test_...)
Cards:     Test cards (4242...)
Data:      Isolated test data
Webhooks:  Stripe CLI or ngrok
```

### 🚀 Production Mode

```
Frontend:  your-domain.com
Backend:   api.your-domain.com
Stripe:    Live mode (pk_live_...)
Cards:     Real credit cards
Data:      Production database
Webhooks:  Production endpoint
```

---

## Success Metrics

### What You Can Track

```
In Stripe Dashboard:
├── Total revenue
├── Successful payments
├── Failed payments
├── Active subscriptions
├── Churn rate
├── MRR (Monthly Recurring Revenue)
└── Customer lifetime value

In Your Backend Logs:
├── Session creation rate
├── Payment completion rate
├── Error frequency
├── API response times
└── Webhook delivery success
```

---

## Monitoring Checklist

✅ Stripe Dashboard → Payments tab  
✅ Stripe Dashboard → Webhooks tab  
✅ Backend server logs  
✅ Frontend error console  
✅ Network tab (dev tools)  
✅ Email delivery  
✅ User feedback  

---

*Architecture designed for scalability, security, and maintainability*
