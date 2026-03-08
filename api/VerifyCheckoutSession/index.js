// Verify Stripe Checkout Session - Azure Function
// Validates payment completion and returns session details

const {
  getStripeInstance,
  successResponse,
  errorResponse,
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

  const { sessionId } = req.params;

  logExecution(context, 'VerifyCheckoutSession invoked', {
    sessionId,
  });

  try {
    if (!sessionId) {
      return errorResponse('Session ID is required', 400);
    }

    // Initialize Stripe
    const stripe = getStripeInstance();

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logExecution(context, 'Session retrieved successfully', {
      sessionId: session.id,
      status: session.payment_status,
    });

    context.res = successResponse({
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      subscriptionId: session.subscription,
      customerId: session.customer,
    });
  } catch (error) {
    logExecution(context, 'Error verifying checkout session', {
      error: error.message,
      sessionId,
    });

    if (error.type === 'StripeInvalidRequestError') {
      context.res = errorResponse(
        'Invalid session ID',
        404,
        'Session not found'
      );
    } else {
      context.res = errorResponse(
        'Failed to verify session',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  }
};
