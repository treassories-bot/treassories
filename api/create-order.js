const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, cart, address } = req.body || {}; // rupees me aata hai frontend se

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
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

    res.status(200).json({
      orderId: order.id,
      amount: options.amount,
      keyId: process.env.RAZORPAY_KEY_ID, // ye public key hai, frontend ko bhejna safe hai
    });
  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ error: 'Order creation failed' });
  }
};
