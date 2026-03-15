// Create Stripe Checkout Session - Azure Function
// Industry-standard implementation with comprehensive error handling

const {
  getStripeInstance,
  successResponse,
  errorResponse,
  validateFields,
  logExecution,
  getCorsHeaders,
} = require('../shared/stripeUtils');

module.exports = async function (context, req) {
  // Handle OPTIONS preflight for CORS
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers: getCorsHeaders(),
      body: '',
    };
    return;
  }

  logExecution(context, 'CreateCheckoutSession invoked', {
    method: req.method,
  });

  try {
    // Validate request body
    const { priceId, customerEmail, customerName } = req.body;

    validateFields(req.body, ['priceId']);

    if (!priceId) {
      return errorResponse('Price ID is required', 400);
    }

    // Initialize Stripe
    const stripe = getStripeInstance();

    // Get frontend URL for redirects
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment?canceled=true`,
      customer_email: customerEmail || undefined,
      metadata: {
        customerName: customerName || '',
        source: 'Azure Architecture Designer',
        timestamp: new Date().toISOString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          customerName: customerName || '',
        },
      },
    });

    logExecution(context, 'Checkout session created successfully', {
      sessionId: session.id,
      email: customerEmail,
    });

    context.res = successResponse({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logExecution(context, 'Error creating checkout session', {
      error: error.message,
      stack: error.stack,
    });

    if (error.type === 'StripeInvalidRequestError') {
      context.res = errorResponse(
        'Invalid request to Stripe',
        400,
        error.message
      );
    } else {
      context.res = errorResponse(
        'Failed to create checkout session',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  }
};
