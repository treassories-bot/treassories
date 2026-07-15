const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { category, search, limit } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);
    if (limit) query = query.limit(Number(limit));

    const { data, error } = await query;

    if (error) {
      console.error('products fetch error:', error);
      return res.status(500).json({ error: 'Could not fetch products' });
    }

    // Cached at Vercel's edge for 60s, served stale for up to 5 min while revalidating —
    // this is what protects the site (and Supabase) from a sudden traffic spike.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ products: data });
  } catch (err) {
    console.error('products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
