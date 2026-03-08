const Razorpay = require('razorpay');
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
    const { amount, planName, customerEmail, customerName, customerId } = req.body;

    // Validate required fields
    if (!amount || !planName || !customerEmail) {
      context.res.status = 400;
      context.res.body = { error: 'Missing required fields' };
      return;
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order
    const options = {
      amount: amount, // Amount in paise (already converted in frontend)
      currency: 'INR',
      receipt: `receipt_${customerId}_${Date.now()}`,
      notes: {
        planName,
        customerEmail,
        customerName,
        customerId,
      },
    };

    const order = await razorpay.orders.create(options);

    context.log('Order created:', order.id);

    context.res.status = 200;
    context.res.body = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    context.log.error('Error creating Razorpay order:', error);
    context.res.status = 500;
    context.res.body = { 
      error: 'Failed to create order',
      message: error.message 
    };
  }
};
