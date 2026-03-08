// Create Stripe Billing Portal Session - Azure Function
// Allows customers to manage their subscriptions

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

  logExecution(context, 'CreatePortalSession invoked');

  try {
    const { customerId } = req.body;

    validateFields(req.body, ['customerId']);

    // Initialize Stripe
    const stripe = getStripeInstance();

    // Get frontend URL for return
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendUrl}/app`,
    });

    logExecution(context, 'Portal session created successfully', {
      customerId,
    });

    context.res = successResponse({
      url: portalSession.url,
    });
  } catch (error) {
    logExecution(context, 'Error creating portal session', {
      error: error.message,
    });

    if (error.type === 'StripeInvalidRequestError') {
      context.res = errorResponse(
        'Invalid customer ID',
        400,
        error.message
      );
    } else {
      context.res = errorResponse(
        'Failed to create portal session',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  }
};
