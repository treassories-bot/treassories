const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { amount, cart, address } = JSON.parse(event.body || '{}');

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
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
      return { statusCode: 500, body: JSON.stringify({ error: 'Order save failed' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ orderId }) };
  } catch (err) {
    console.error('cod-order error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
