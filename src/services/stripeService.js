// Stripe Integration Service
// Handles all Stripe-related operations on the frontend

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Backend API URL - automatically switches between dev and production
// For Azure Static Web Apps, the API is automatically available at /api
const API_URL = import.meta.env.VITE_STRIPE_BACKEND_URL || 
  (import.meta.env.MODE === 'production' 
    ? '/api'  // Azure SWA automatically routes /api to Functions
    : 'http://localhost:7071/api');

/**
 * Create a Stripe Checkout session and redirect to Stripe
 * @param {string} priceId - Stripe Price ID for the product
 * @param {string} customerEmail - Customer's email
 * @param {string} customerName - Customer's name
 * @returns {Promise} - Redirects to Stripe Checkout
 */
export async function createCheckoutSession(priceId, customerEmail, customerName) {
  try {
    // Call backend to create checkout session
    const response = await fetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail,
        customerName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();

    // Get Stripe.js instance
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Verify a checkout session after payment
 * @param {string} sessionId - Stripe Checkout Session ID
 * @returns {Promise<Object>} - Session details
 */
export async function verifyCheckoutSession(sessionId) {
  try {
    const response = await fetch(`${API_URL}/checkout-session/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify session');
    }

    const sessionData = await response.json();
    return sessionData;
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    throw error;
  }
}

/**
 * Create a billing portal session for subscription management
 * @param {string} customerId - Stripe Customer ID
 * @returns {Promise<string>} - Portal URL
 */
export async function createPortalSession(customerId) {
  try {
    const response = await fetch(`${API_URL}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

/**
 * Get list of available products/prices
 * @returns {Promise<Array>} - List of products
 */
export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    const { prices } = await response.json();
    return prices;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Check if backend server is running
 * @returns {Promise<boolean>} - Server health status
 */
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      timeout: 3000,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}

export default {
  createCheckoutSession,
  verifyCheckoutSession,
  createPortalSession,
  getProducts,
  checkServerHealth,
};
