const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, cart, address } = req.body || {};

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const orderId = 'COD' + Date.now().toString().slice(-8);

    const { error } = await supabase.from('orders').insert({
      order_id: orderId,
      amount,
      cart,
      address,
      payment_method: 'cod',
      status: 'cod-pending',
    });

    if (error) {
      console.error('supabase insert error:', error);
      return res.status(500).json({ error: 'Order save failed' });
    }

    res.status(200).json({ orderId });
  } catch (err) {
    console.error('cod-order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
