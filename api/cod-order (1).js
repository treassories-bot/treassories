const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cart, address } = req.body || {};

    if (!Array.isArray(cart) || !cart.length) {
      return res.status(400).json({ error: 'Your bag is empty' });
    }

    // Amount kabhi bhi client se nahi lete — cart ke ids se DB se actual price nikal ke
    // khud jodte hain, taaki koi browser se amount tamper na kar sake.
    const ids = [...new Set(cart.map(i => Number(i.id)))];
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, price, in_stock')
      .in('id', ids);

    if (prodErr || !products) {
      console.error('cod-order product lookup error:', prodErr);
      return res.status(500).json({ error: 'Could not verify your bag' });
    }

    let amount = 0;
    for (const item of cart) {
      const p = products.find(x => x.id === Number(item.id));
      if (!p || !p.in_stock) {
        return res.status(400).json({ error: 'One or more items in your bag are no longer available' });
      }
      amount += Number(p.price) * Math.max(1, Number(item.qty) || 1);
    }
    if (amount <= 0) {
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
