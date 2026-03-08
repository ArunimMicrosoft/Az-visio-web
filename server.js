/* eslint-disable no-undef */
// Stripe Payment Backend Server
// Handles secure Stripe API calls and webhooks

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// For webhook endpoint, we need raw body
app.use('/webhook', express.raw({ type: 'application/json' }));

// For other endpoints, parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stripe backend is running' });
});

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerEmail, customerName } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // or 'payment' for one-time payments
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || '',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Retrieve Checkout Session (verify payment)
app.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session',
      message: error.message 
    });
  }
});

// Webhook handler for Stripe events
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      // TODO: Fulfill the purchase (activate subscription, send confirmation email, etc.)
      await handleSuccessfulPayment(session);
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      // TODO: Handle new subscription
      break;
    }

    case 'customer.subscription.updated': {
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      // TODO: Handle subscription update
      break;
    }

    case 'customer.subscription.deleted': {
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // TODO: Handle subscription cancellation
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log('Invoice payment succeeded:', invoice.id);
      // TODO: Handle successful payment
      break;
    }

    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object;
      console.log('Invoice payment failed:', failedInvoice.id);
      // TODO: Handle failed payment (send notification, etc.)
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
  // TODO: Implement your business logic here
  // Examples:
  // - Update user's subscription status in database
  // - Send confirmation email
  // - Grant access to premium features
  // - Create invoice/receipt
  
  console.log('Processing successful payment for:', {
    email: session.customer_email,
    amount: session.amount_total / 100,
    currency: session.currency,
    subscriptionId: session.subscription,
  });

  // Add your implementation here
}

// Create a portal session for subscription management
app.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error.message 
    });
  }
});

// Get list of available prices/products
app.get('/products', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    res.json({ prices: prices.data });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Stripe Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔐 Stripe API Version: 2024-12-18.acacia`);
  console.log(`\n✅ Ready to process payments!\n`);
});
