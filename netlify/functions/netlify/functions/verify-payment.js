const crypto = require('crypto');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ verified: false, error: 'Method not allowed' }) };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body || '{}');

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { statusCode: 400, body: JSON.stringify({ verified: false, error: 'Missing fields' }) };
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    // TODO: isValid true hone par order ka status database me "paid" karo

    return {
      statusCode: isValid ? 200 : 400,
      body: JSON.stringify({ verified: isValid, orderId: razorpay_order_id }),
    };
  } catch (err) {
    console.error('verify-payment error:', err);
    return { statusCode: 500, body: JSON.stringify({ verified: false, error: 'Server error' }) };
  }
};
