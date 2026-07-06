-- Menambahkan kolom yang diperlukan untuk Tripay dan Delivery (tas belanja, driver)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS needs_bag BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS driver_type TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_method_code TEXT,
ADD COLUMN IF NOT EXISTS payment_qr_url TEXT,
ADD COLUMN IF NOT EXISTS payment_instructions JSONB;
