CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  access_pin TEXT,
  is_active BOOLEAN DEFAULT true,
  avg_prep_time_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);
