-- ═══════════ PRODUCTS TABLE ═══════════
create table products (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  category text not null check (category in ('men','women')),
  price numeric not null,
  old_price numeric,
  description text default '',
  image_url text,
  emoji text default '✦',
  tag text default '',
  rating numeric default 4.5,
  in_stock boolean default true,
  created_at timestamptz default now()
);

-- ═══════════ REVIEWS TABLE ═══════════
create table reviews (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text default '',
  created_at timestamptz default now()
);

-- ═══════════ ROW LEVEL SECURITY ═══════════
-- Anyone can VIEW products/reviews. Only our backend (service key) can add/edit —
-- this stops random people from inserting fake products directly via the API.
alter table products enable row level security;
create policy "Public can view products" on products for select using (true);

alter table reviews enable row level security;
create policy "Public can view reviews" on reviews for select using (true);

-- ═══════════ ORDERS TABLE ═══════════
-- create-order.js, cod-order.js aur verify-payment.js teeno is table ko use karte hain,
-- par ye pehle schema me define hi nahi thi — agar Supabase me already nahi hai to ye
-- block zaroor run karo, warna orders save hi nahi ho rahe honge.
create table orders (
  id bigint generated always as identity primary key,
  order_id text unique not null,
  amount numeric not null,
  cart jsonb not null,
  address jsonb not null,
  payment_method text not null check (payment_method in ('online','cod')),
  status text not null default 'created',
  payment_id text,
  created_at timestamptz default now()
);

-- RLS on, koi public policy nahi — sirf backend (service key) hi orders padh/likh sakta hai,
-- kyunki abhi koi "my orders" page nahi hai aur isme address/phone jaisa sensitive data hai.
alter table orders enable row level security;

-- ═══════════ SEED — your existing 12 products, moved into the database ═══════════
insert into products (slug, name, category, price, old_price, emoji, tag, rating, description) values
('sovereign-chrono','Sovereign Chrono','men',2499,4999,'⌚','Signature',4.8,'A precision timepiece crafted for the modern gentleman. Stainless steel case, sapphire crystal glass, and a movement built to last generations.'),
('heritage-wallet','Heritage Wallet','men',899,1499,'👛','Bestseller',4.6,'Full-grain leather wallet with hand-stitched edges. Six card slots, a bill compartment, and a coin pocket — everything you need, nothing you don''t.'),
('noir-aviators','Noir Aviators','men',1299,2199,'🕶️','New',4.7,'Classic aviator silhouette in matte black, with polarized UV400 lenses for all-day comfort and protection.'),
('obsidian-belt','Obsidian Belt','men',699,1199,'🥋','',4.5,'A refined leather belt with a brushed steel buckle. Pairs effortlessly with both formal and casual wear.'),
('midnight-silk-tie','Midnight Silk Tie','men',549,999,'👔','',4.4,'100% mulberry silk tie in deep midnight blue, woven with a subtle textured pattern.'),
('forge-steel-cuff','Forge Steel Cuff','men',799,1399,'⛓️','Trending',4.6,'A bold statement cuff in brushed steel, designed to be worn alone or stacked.'),
('lumiere-pearls','Lumière Pearls','women',1899,3499,'📿','Signature',4.9,'Freshwater pearl necklace with an 18k gold-plated clasp. Timeless, versatile, endlessly elegant.'),
('vienna-tote','Vienna Tote','women',2299,4599,'👜','Bestseller',4.8,'Structured leather tote with gold-tone hardware and a spacious interior — built for the woman who does it all.'),
('etoile-drops','Étoile Drops','women',1599,2999,'💎','New',4.9,'Delicate drop earrings featuring cubic zirconia stones set in gold-plated sterling silver.'),
('aurora-band','Aurora Band','women',1199,2199,'💍','Signature',4.7,'A minimalist gold-plated band with a subtle hammered texture, designed to be worn every day.'),
('cashmere-wrap','Cashmere Wrap','women',649,1099,'🧣','',4.5,'A featherlight cashmere-blend wrap in a soft neutral tone, perfect for cool evenings.'),
('celeste-anklet','Celeste Anklet','women',499,899,'✨','Trending',4.6,'A dainty chain anklet with tiny star charms, in gold-plated sterling silver.');
