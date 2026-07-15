const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'Missing slug' });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ product: data });
  } catch (err) {
    console.error('product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
