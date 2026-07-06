ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id),
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine-in' CHECK (order_type IN ('dine-in','pickup','delivery')),
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS customer_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS driver_type TEXT CHECK (driver_type IN ('gosend','grabexpress')),
ADD COLUMN IF NOT EXISTS estimated_arrival_minutes INTEGER,
ADD COLUMN IF NOT EXISTS payment_channel TEXT,
ADD COLUMN IF NOT EXISTS agreed_terms BOOLEAN DEFAULT false;
