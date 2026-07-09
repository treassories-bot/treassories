const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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

    if (isValid) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid', payment_id: razorpay_payment_id })
        .eq('order_id', razorpay_order_id);
      if (error) console.error('supabase update error:', error);
    }

    return {
      statusCode: isValid ? 200 : 400,
      body: JSON.stringify({ verified: isValid, orderId: razorpay_order_id }),
    };
  } catch (err) {
    console.error('verify-payment error:', err);
    return { statusCode: 500, body: JSON.stringify({ verified: false, error: 'Server error' }) };
  }
};
