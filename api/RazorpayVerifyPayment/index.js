const crypto = require('crypto');

module.exports = async function (context, req) {
  // Enable CORS
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  try {
    const { orderId, paymentId, signature } = req.body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      context.res.status = 400;
      context.res.body = { error: 'Missing required payment data' };
      return;
    }

    // Verify signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    const isValidSignature = generatedSignature === signature;

    if (!isValidSignature) {
      context.log.error('Invalid payment signature');
      context.res.status = 400;
      context.res.body = {
        verified: false,
        error: 'Payment verification failed',
      };
      return;
    }

    context.log('Payment verified successfully:', paymentId);

    // Here you would typically:
    // 1. Update user subscription in database
    // 2. Send confirmation email
    // 3. Create invoice

    context.res.status = 200;
    context.res.body = {
      verified: true,
      paymentId,
      orderId,
      message: 'Payment verified successfully',
    };
  } catch (error) {
    context.log.error('Error verifying payment:', error);
    context.res.status = 500;
    context.res.body = {
      verified: false,
      error: 'Payment verification failed',
      message: error.message,
    };
  }
};
