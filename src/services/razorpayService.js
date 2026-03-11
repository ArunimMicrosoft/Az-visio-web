// Razorpay Integration Service
// Industry-standard payment gateway integration for India

// Backend API URL - automatically switches between dev and production
const API_URL = import.meta.env.VITE_RAZORPAY_BACKEND_URL || 
  (import.meta.env.MODE === 'production' 
    ? '/api'  // Azure SWA automatically routes /api to Functions
    : 'http://localhost:7071/api');

// Razorpay Key ID (public key, safe to expose)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Load Razorpay checkout script
 * The script is also preloaded in index.html for reliability.
 * This function checks if it's already available, and retries if not.
 * @returns {Promise<boolean>} - Script loaded successfully
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Check if already loaded (from index.html preload or previous call)
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // If the script tag exists but hasn't finished loading, wait for it
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      // Wait up to 10 seconds for the existing script to load
      let waited = 0;
      const checkInterval = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (waited >= 10000) {
          clearInterval(checkInterval);
          // Remove the failed script and try fresh
          existingScript.remove();
          loadFreshScript(resolve);
        }
        waited += 200;
      }, 200);
      return;
    }

    // No script tag found — load fresh
    loadFreshScript(resolve);
  });
}

/**
 * Load a fresh Razorpay script tag
 */
function loadFreshScript(resolve) {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => {
    console.error('Failed to load Razorpay script from CDN');
    resolve(false);
  };
  document.body.appendChild(script);
}

/**
 * Create a Razorpay order and open checkout
 * @param {Object} options - Payment options
 * @param {string} options.planName - Plan name (Professional/Enterprise)
 * @param {number} options.amount - Amount in INR (e.g., 4099 for ₹4,099)
 * @param {string} options.customerEmail - Customer email
 * @param {string} options.customerName - Customer name
 * @param {string} options.customerId - User ID for tracking
 * @returns {Promise<Object>} - Payment response
 */
export async function createRazorpayOrder({ planName, amount, customerEmail, customerName, customerId }) {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay checkout. Please check your internet connection, disable any ad-blockers, and try again.');
    }    // Create order on backend
    let response;
    try {
      response = await fetch(`${API_URL}/razorpay-create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise (₹4,099 → 409900)
          planName,
          customerEmail,
          customerName,
          customerId,
        }),
      });
    } catch (networkErr) {
      // Network error — backend is not reachable
      throw new Error(
        'Payment server is not reachable. Please make sure the backend is running, or try again after deployment.'
      );
    }

    if (!response.ok) {
      let errMsg = 'Failed to create Razorpay order';
      try {
        const error = await response.json();
        errMsg = error.message || errMsg;
      } catch (_) { /* response wasn't JSON */ }
      throw new Error(errMsg);
    }

    const { orderId, amount: orderAmount, currency } = await response.json();

    // Return a promise that resolves when payment is complete
    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: 'Azure Architecture Designer',
        description: `${planName} Plan Subscription`,
        order_id: orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
        },
        theme: {
          color: '#0078D4', // Azure blue
        },
        handler: function (response) {
          // Payment successful
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            // User closed the payment modal
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    });  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    // Provide user-friendly message when backend is unreachable
    if (error.message === 'Failed to fetch' || error.message?.includes('NetworkError')) {
      throw new Error(
        'Payment service is not available yet. Razorpay integration is pending activation. ' +
        'Please try again later or contact support at arunimit3004@gmail.com'
      );
    }
    throw error;
  }
}

/**
 * Verify payment on backend after successful payment
 * @param {Object} paymentData - Payment response from Razorpay
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyRazorpayPayment(paymentData) {
  try {
    const response = await fetch(`${API_URL}/razorpay-verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Create a subscription for recurring payments
 * @param {Object} options - Subscription options
 * @param {string} options.planId - Razorpay Plan ID
 * @param {string} options.customerEmail - Customer email
 * @param {string} options.customerName - Customer name
 * @param {string} options.customerId - User ID
 * @returns {Promise<Object>} - Subscription response
 */
export async function createSubscription({ planId, customerEmail, customerName, customerId }) {
  try {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay checkout script');
    }

    const response = await fetch(`${API_URL}/razorpay-create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        customerEmail,
        customerName,
        customerId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription');
    }

    const { subscriptionId, planDetails } = await response.json();

    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'Azure Architecture Designer',
        description: `${planDetails.name} Subscription`,
        prefill: {
          name: customerName,
          email: customerEmail,
        },
        theme: {
          color: '#0078D4',
        },
        handler: function (response) {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            subscriptionId: response.razorpay_subscription_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Subscription cancelled by user'));
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Check if backend server is running
 * @returns {Promise<boolean>} - Server health status
 */
export async function checkServerHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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

/**
 * Get pricing plans
 * @returns {Array} - List of pricing plans
 */
export function getPricingPlans() {
  return [
    {
      id: 'starter',
      name: 'Starter',
      priceUSD: 15,
      priceINR: 1249,
      interval: 'month',
      features: [
        'Up to 100 diagrams',
        '5 workspaces',
        'Basic analytics',
        'Email support',
        'PNG/SVG exports',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      priceUSD: 49,
      priceINR: 4099,
      interval: 'month',
      popular: true,
      features: [
        'Up to 10,000 diagrams',
        'Unlimited workspaces',
        'Advanced analytics',
        'Priority support',
        'All export formats',
        'Custom domains',
        'Terraform/ARM exports',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceUSD: 199,
      priceINR: 16649,
      interval: 'month',
      features: [
        'Unlimited everything',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
        'Webhook integrations',
        'API access',
        'Audit logs',
        'SSO/SAML',
      ],
    },
  ];
}

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createSubscription,
  checkServerHealth,
  getPricingPlans,
};
