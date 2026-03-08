// Shared Stripe Configuration for Azure Functions
// Industry-standard setup with error handling and logging

const Stripe = require('stripe');

// Initialize Stripe with secret key from environment
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
    maxNetworkRetries: 3,
    timeout: 10000, // 10 seconds
  });
};

// CORS headers for Static Web Apps integration
const getCorsHeaders = () => {
  const frontendUrl = process.env.FRONTEND_URL || '*';
  
  return {
    'Access-Control-Allow-Origin': frontendUrl,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    'Access-Control-Max-Age': '86400',
  };
};

// Standard success response
const successResponse = (data, statusCode = 200) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(),
    },
    body: JSON.stringify(data),
  };
};

// Standard error response
const errorResponse = (message, statusCode = 500, details = null) => {
  const errorBody = {
    error: message,
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    errorBody.details = details;
  }
  
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(),
    },
    body: JSON.stringify(errorBody),
  };
};

// Validate required fields
const validateFields = (body, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!body[field]) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Log function execution (for Application Insights)
const logExecution = (context, message, data = {}) => {
  context.log({
    message,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

module.exports = {
  getStripeInstance,
  getCorsHeaders,
  successResponse,
  errorResponse,
  validateFields,
  logExecution,
};
