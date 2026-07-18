const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { product_id } = req.query;
      if (!product_id) return res.status(400).json({ error: 'Missing product_id' });

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('reviews fetch error:', error);
        return res.status(500).json({ error: 'Could not fetch reviews' });
      }

      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
      return res.status(200).json({ reviews: data });
    } catch (err) {
      console.error('reviews error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { product_id, name, rating, comment } = req.body || {};

      if (!product_id || !name || !rating) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      if (String(name).length > 80) {
        return res.status(400).json({ error: 'Name is too long' });
      }
      if (String(comment || '').length > 1000) {
        return res.status(400).json({ error: 'Review is too long (max 1000 characters)' });
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({ product_id, name: String(name).trim(), rating: numRating, comment: String(comment || '').trim() })
        .select()
        .single();

      if (error) {
        console.error('review insert error:', error);
        return res.status(500).json({ error: 'Could not save review' });
      }

      return res.status(200).json({ review: data });
    } catch (err) {
      console.error('review post error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
