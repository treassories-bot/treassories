const Razorpay = require('razorpay');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { amount } = JSON.parse(event.body || '{}'); // rupees me aata hai frontend se

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay paise me leta hai
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // TODO: order ko yahan database me bhi save karo (Supabase/Firebase/etc), abhi return hi ho raha hai

    return {
      statusCode: 200,
      body: JSON.stringify({
        orderId: order.id,
        amount: options.amount,
        keyId: process.env.RAZORPAY_KEY_ID, // ye public key hai, frontend ko bhejna safe hai
      }),
    };
  } catch (err) {
    console.error('create-order error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Order creation failed' }) };
  }
};
