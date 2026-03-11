// Razorpay Integration Service
// Industry-standard payment gateway integration for India

// Razorpay Key ID (public key, safe to expose in frontend)
// No backend needed — using Razorpay client-side checkout (free infra, $0 hosting)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SOgR5AT25pzqAs';

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
/**
 * Create a Razorpay checkout — NO BACKEND REQUIRED
 * Uses Razorpay client-side checkout (amount + key only, no order_id)
 * This works on Azure SWA Free tier with $0 infra cost.
 * Payment verification is done via Razorpay webhook or dashboard.
 */
export async function createRazorpayOrder({ planName, amount, customerEmail, customerName, customerId }) {
  try {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay checkout. Please disable ad-blockers and try again.');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Convert to paise (₹4,099 → 409900)
        currency: 'INR',
        name: 'Azure Architecture Designer',
        description: `${planName} Plan - Monthly Subscription`,
        prefill: {
          name: customerName,
          email: customerEmail,
        },
        notes: {
          planName,
          customerId,
          customerEmail,
        },
        theme: {
          color: '#0078D4',
        },
        handler: function (response) {
          // Payment captured — resolve with payment details
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || null,
            signature: response.razorpay_signature || null,
          });
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        reject(new Error(response.error.description || 'Payment failed'));
      });
      rzp.open();
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    throw error;
  }
}

/**
 * Verify payment — stub for client-side only mode.
 * On Azure SWA Free tier, there is no backend API.
 * Payment is captured client-side via Razorpay handler.
 * Webhook verification can be done via Razorpay dashboard.
 * @param {Object} paymentData - Payment response from Razorpay
 * @returns {Promise<Object>} - Always returns { verified: true }
 */
export async function verifyRazorpayPayment(paymentData) {
  // No backend on Azure SWA Free tier — treat any captured payment as verified.
  // Real signature verification should be done server-side (webhook) in production.
  console.log('Payment captured (client-side):', paymentData?.paymentId);
  return { verified: true, paymentId: paymentData?.paymentId };
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
// eslint-disable-next-line no-unused-vars
export async function createSubscription(_options) {  // NOTE: Subscriptions require a backend (Razorpay subscription_id).
  // This is not available on Azure SWA Free tier.
  // Use createRazorpayOrder() for one-time payments instead.
  throw new Error('Subscriptions require a backend server. Use one-time payment instead.');
}

/**
 * Check if backend server is running
 * Always returns false on Azure SWA Free tier (no managed API).
 * @returns {Promise<boolean>} - Server health status
 */
export async function checkServerHealth() {
  // No backend on Azure SWA Free tier
  return false;
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
