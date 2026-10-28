-- =========================================================================
-- Gym & Leno - Complete Supabase PostgreSQL Schema
-- =========================================================================

-- 1. Memberships & Plans
CREATE TABLE IF NOT EXISTS gym_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price_egp NUMERIC NOT NULL,
  original_price_egp NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  duration_label_en TEXT NOT NULL,
  duration_label_ar TEXT NOT NULL,
  features_en JSONB NOT NULL DEFAULT '[]',
  features_ar JSONB NOT NULL DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Egyptian Payment Methods
CREATE TABLE IF NOT EXISTS gym_payment_methods (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  wallet_number TEXT,
  instapay_handle TEXT,
  bank_details JSONB,
  fawry_code TEXT,
  instructions_en TEXT,
  instructions_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 1,
  is_online_gateway BOOLEAN DEFAULT false
);

-- 3. Trainers
CREATE TABLE IF NOT EXISTS gym_trainers (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  specialty_en TEXT NOT NULL,
  specialty_ar TEXT NOT NULL,
  bio_en TEXT,
  bio_ar TEXT,
  experience_years INTEGER DEFAULT 5,
  rating NUMERIC DEFAULT 5.0,
  image TEXT,
  available_days JSONB DEFAULT '[]',
  programs_offered JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}'
);

-- 4. Training Programs
CREATE TABLE IF NOT EXISTS gym_programs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  duration_weeks INTEGER DEFAULT 8,
  difficulty TEXT DEFAULT 'All Levels',
  difficulty_ar TEXT DEFAULT 'جميع المستويات',
  sessions_per_week INTEGER DEFAULT 4,
  coach_id TEXT,
  image TEXT,
  highlights_en JSONB DEFAULT '[]',
  highlights_ar JSONB DEFAULT '[]'
);

-- 5. Members
CREATE TABLE IF NOT EXISTS gym_members (
  id TEXT PRIMARY KEY,
  membership_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  plan_id TEXT REFERENCES gym_plans(id),
  trainer_id TEXT REFERENCES gym_trainers(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, expiring_soon, expired, pending
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Booking Requests & Payment Submissions
CREATE TABLE IF NOT EXISTS gym_bookings (
  id TEXT PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  plan_id TEXT REFERENCES gym_plans(id),
  trainer_id TEXT,
  preferred_shift TEXT DEFAULT 'evening',
  payment_method_id TEXT REFERENCES gym_payment_methods(id),
  transaction_ref TEXT,
  proof_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  total_amount_egp NUMERIC NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Media Library
CREATE TABLE IF NOT EXISTS gym_media (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size_formatted TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Global Site Settings & Content
CREATE TABLE IF NOT EXISTS gym_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
