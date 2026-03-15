// Stripe Webhook Handler - Azure Function
// Processes Stripe events with signature verification

const {
  getStripeInstance,
  successResponse,
  errorResponse,
  logExecution,
} = require('../shared/stripeUtils');

module.exports = async function (context, req) {
  logExecution(context, 'Webhook invoked');

  try {
    const stripe = getStripeInstance();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logExecution(context, 'Webhook secret not configured', {
        level: 'warning',
      });
      // Allow webhook to pass in development without secret
      if (process.env.NODE_ENV !== 'development') {
        return errorResponse('Webhook secret not configured', 500);
      }
    }

    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    let event;

    try {
      // Verify webhook signature
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        // Development mode - use body directly
        event = req.body;
      }
    } catch (err) {
      logExecution(context, 'Webhook signature verification failed', {
        error: err.message,
      });
      return errorResponse(`Webhook Error: ${err.message}`, 400);
    }

    logExecution(context, 'Webhook event received', {
      type: event.type,
      id: event.id,
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        logExecution(context, 'Payment successful', {
          sessionId: session.id,
          email: session.customer_email,
          amount: session.amount_total / 100,
        });
        
        // TODO: Fulfill the purchase
        // - Activate subscription in database
        // - Send confirmation email
        // - Grant access to premium features
        await handleSuccessfulPayment(context, session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        logExecution(context, 'Subscription created', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });
        // TODO: Handle new subscription
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        logExecution(context, 'Subscription updated', {
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        // TODO: Handle subscription update
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        logExecution(context, 'Subscription cancelled', {
          subscriptionId: subscription.id,
        });
        // TODO: Handle subscription cancellation
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        logExecution(context, 'Invoice payment succeeded', {
          invoiceId: invoice.id,
          amount: invoice.amount_paid / 100,
        });
        // TODO: Handle successful payment
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        logExecution(context, 'Invoice payment failed', {
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count,
        });
        // TODO: Handle failed payment (send notification, etc.)
        break;
      }

      default:
        logExecution(context, 'Unhandled event type', {
          type: event.type,
        });
    }

    context.res = successResponse({ received: true });
  } catch (error) {
    logExecution(context, 'Webhook processing error', {
      error: error.message,
      stack: error.stack,
    });

    context.res = errorResponse(
      'Webhook processing failed',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
};

// Handle successful payment
async function handleSuccessfulPayment(context, session) {
  logExecution(context, 'Processing successful payment', {
    sessionId: session.id,
    email: session.customer_email,
    amount: session.amount_total / 100,
    currency: session.currency,
    subscriptionId: session.subscription,
  });

  // TODO: Implement your business logic here:
  // 1. Update user's subscription status in database
  // 2. Send confirmation email
  // 3. Grant access to premium features
  // 4. Create invoice/receipt
  // 5. Update analytics

  // Example logging for now
  context.log('✅ Payment processed successfully', {
    customer: session.customer_email,
    amount: `$${(session.amount_total / 100).toFixed(2)}`,
    subscription: session.subscription,
  });
}
