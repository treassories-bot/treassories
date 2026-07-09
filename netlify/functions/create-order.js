const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { amount, cart, address } = JSON.parse(event.body || '{}'); // rupees me aata hai frontend se

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

    // Order ko "created" status ke saath database me save karo — payment verify hone ke baad "paid" ho jayega
    const { error } = await supabase.from('orders').insert({
      order_id: order.id,
      amount,
      cart,
      address,
      payment_method: 'online',
      status: 'created',
    });
    if (error) console.error('supabase insert error:', error);

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
