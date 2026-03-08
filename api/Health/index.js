// Health Check - Azure Function
// Verifies API is running and Stripe connection is working

const {
  getStripeInstance,
  successResponse,
  errorResponse,
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

  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Stripe Payment API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
    };

    // Try to connect to Stripe
    try {
      const stripe = getStripeInstance();
      await stripe.balance.retrieve();
      health.stripe = 'connected';
    } catch (error) {
      health.stripe = 'error';
      health.stripeError = error.message;
    }

    context.res = successResponse(health);
  } catch (error) {
    context.res = errorResponse('Health check failed', 500, error.message);
  }
};
