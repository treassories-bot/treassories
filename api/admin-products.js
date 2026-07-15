const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { password, id, name, category, price, old_price, description, image_url, emoji, tag } = req.body || {};

    // Simple password check — set ADMIN_PASSWORD in Vercel environment variables.
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Incorrect admin password' });
    }
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category and price are required' });
    }
    if (category !== 'men' && category !== 'women') {
      return res.status(400).json({ error: 'Category must be men or women' });
    }

    const payload = {
      name,
      category,
      price: Number(price),
      old_price: old_price ? Number(old_price) : null,
      description: description || '',
      image_url: image_url || null,
      emoji: emoji || '✦',
      tag: tag || '',
    };

    let result;
    if (id) {
      result = await supabase.from('products').update(payload).eq('id', id).select().single();
    } else {
      payload.slug = slugify(name) + '-' + Date.now().toString().slice(-5);
      result = await supabase.from('products').insert(payload).select().single();
    }

    if (result.error) {
      console.error('admin product save error:', result.error);
      return res.status(500).json({ error: 'Could not save product' });
    }

    res.status(200).json({ product: result.data });
  } catch (err) {
    console.error('admin-products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
