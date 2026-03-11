// filepath: c:\Users\labadmin\Desktop\python-mini\Az visio web\src\services\stripeService.js
// ⚠️ DEPRECATED — Stripe has been replaced by Razorpay.
// See src/services/razorpayService.js for the active payment integration.
// This file is kept per project rules (no file deletions).

const DEPRECATED_MSG = 'stripeService is deprecated. Use razorpayService instead.';

export async function createCheckoutSession() {
  console.warn(DEPRECATED_MSG);
  throw new Error(DEPRECATED_MSG);
}

export async function verifyCheckoutSession() {
  console.warn(DEPRECATED_MSG);
  throw new Error(DEPRECATED_MSG);
}

export async function createPortalSession() {
  console.warn(DEPRECATED_MSG);
  throw new Error(DEPRECATED_MSG);
}

export async function getProducts() {
  console.warn(DEPRECATED_MSG);
  throw new Error(DEPRECATED_MSG);
}

export async function checkServerHealth() {
  console.warn(DEPRECATED_MSG);
  return false;
}

export default {
  createCheckoutSession,
  verifyCheckoutSession,
  createPortalSession,
  getProducts,
  checkServerHealth,
};
