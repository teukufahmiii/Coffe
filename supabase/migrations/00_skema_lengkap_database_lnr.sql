-- ==============================================================================
-- SKEMA DATABASE LENGKAP LNR COFFEE
-- 
-- Dokumen ini merupakan referensi skema lengkap untuk database LNR Coffee.
-- Catatan: File ini adalah gabungan dari semua file migrasi yang telah dijalankan,
-- dibuat sebagai dokumentasi yang mudah dibaca.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Tabel: menu_items (Daftar menu kopi, non-coffee, snack)
-- ------------------------------------------------------------------------------
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('coffee','non-coffee','snack')),
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Tabel: branches (Cabang / Outlet LNR Coffee)
-- ------------------------------------------------------------------------------
CREATE TABLE public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  avg_prep_time_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Tabel: orders (Data pesanan pelanggan)
-- ------------------------------------------------------------------------------
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL CHECK (table_number BETWEEN 1 AND 30),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cooking','served','paid','cancelled', 'processing', 'completed')),
  total NUMERIC NOT NULL CHECK (total >= 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Delivery & Payment Fields
  branch_id UUID REFERENCES public.branches(id),
  order_type TEXT DEFAULT 'dine-in' CHECK (order_type IN ('dine-in','pickup','delivery')),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  driver_type TEXT CHECK (driver_type IN ('gosend','grabexpress')),
  estimated_arrival_minutes INTEGER,
  payment_channel TEXT,
  agreed_terms BOOLEAN DEFAULT false,
  needs_bag BOOLEAN DEFAULT false,
  payment_reference TEXT,
  payment_url TEXT,
  payment_method_code TEXT,
  payment_qr_url TEXT,
  payment_instructions JSONB
);

-- ------------------------------------------------------------------------------
-- 4. Tabel: order_items (Rincian item dalam pesanan)
-- ------------------------------------------------------------------------------
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. Tabel: reviews (Ulasan pelanggan)
-- ------------------------------------------------------------------------------
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT,
  product_ratings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. Tabel: profiles (Profil Pengguna: Nama, No. HP, PIN, dll)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0, -- LNR Points System
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. Tabel: vouchers (Daftar voucher diskon & penukaran poin)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_visual BOOLEAN DEFAULT false,
  image_url TEXT,
  points_required INTEGER DEFAULT 0,
  is_permanent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- KEBIJAKAN KEAMANAN (ROW LEVEL SECURITY / RLS)
-- ==============================================================================
-- Semua tabel dilengkapi dengan Row Level Security untuk mengatur hak akses.
-- Aturan mendasar:
-- - Anonim (publik) dapat melihat menu, daftar cabang, review, profil publik, dan voucher.
-- - Anonim (publik) dapat membuat pesanan, detail pesanan, profil, dan review.
-- - Kasir/Admin (authenticated) memiliki akses penuh atau melihat data transaksi tertutup.
-- ==============================================================================
