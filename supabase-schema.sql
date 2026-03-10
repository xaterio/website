-- Run this in your Supabase SQL Editor
-- https://app.supabase.com → SQL Editor → New query

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  client_name TEXT,
  business_name TEXT,
  business_type TEXT,
  style TEXT,
  pages TEXT[],
  info JSONB DEFAULT '{}',
  photos_urls TEXT[] DEFAULT '{}',
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'generating', 'delivered', 'error')),
  site_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripe_session_id);

-- Activer Row Level Security (sécurité)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Seul le service role peut accéder (les API routes utilisent le service role key)
-- Les utilisateurs publics ne peuvent pas lire/écrire directement
CREATE POLICY "Service role only" ON orders
  USING (false)  -- Deny all public access
  WITH CHECK (false);

-- Table des entreprises prospectées (remplace le CSV local)
CREATE TABLE IF NOT EXISTS prospected_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siren TEXT UNIQUE NOT NULL,
  company_name TEXT,
  email TEXT,
  city TEXT,
  contacted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prospected_siren ON prospected_companies(siren);
ALTER TABLE prospected_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only prospected" ON prospected_companies USING (false) WITH CHECK (false);

-- Storage bucket pour les photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-photos', 'order-photos', true)
ON CONFLICT DO NOTHING;

-- Permettre l'upload de photos (public upload, public read)
CREATE POLICY "Public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'order-photos');

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-photos');
