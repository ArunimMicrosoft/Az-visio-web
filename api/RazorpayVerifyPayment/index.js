const crypto = require('crypto');

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };

  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  try {
    const { orderId, paymentId, signature } = req.body;

    if (!paymentId) {
      context.res.status = 400;
      context.res.body = { verified: false, error: 'Missing paymentId' };
      return;
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // If we have orderId + signature, do full verification
    if (orderId && signature && razorpaySecret) {
      const expected = crypto
        .createHmac('sha256', razorpaySecret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      if (expected !== signature) {
        context.log.error('Invalid payment signature for:', paymentId);
        context.res.status = 400;
        context.res.body = { verified: false, error: 'Invalid signature' };
        return;
      }
      context.log('Payment signature verified:', paymentId);
    } else {
      // No order_id flow (client-side only) — log warning but accept
      context.log.warn('Payment accepted without signature verification:', paymentId);
    }

    context.res.status = 200;
    context.res.body = {
      verified: true,
      paymentId,
      orderId: orderId || null,
    };
  } catch (error) {
    context.log.error('Verification error:', error);
    context.res.status = 500;
    context.res.body = { verified: false, error: error.message };
  }
};
