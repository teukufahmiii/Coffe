-- Migration to add LNR Points system

-- 1. Add points column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. Add points_required column to vouchers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_required INTEGER DEFAULT 0;

-- Fix the typo above (adding to vouchers instead)
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS points_required INTEGER DEFAULT 0;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT false;

-- 3. Insert the point-based vouchers if they don't exist
INSERT INTO public.vouchers (code, title, discount_type, discount_amount, min_order_amount, is_active, is_visual, points_required, is_permanent)
VALUES 
('PTS-10', 'Diskon 10%', 'percentage', 10, 0, true, false, 20, true),
('PTS-20', 'Diskon 20%', 'percentage', 20, 0, true, false, 30, true),
('PTS-35', 'Diskon 35%', 'percentage', 35, 0, true, false, 50, true)
ON CONFLICT (code) DO UPDATE 
SET 
  points_required = EXCLUDED.points_required,
  is_permanent = EXCLUDED.is_permanent,
  discount_amount = EXCLUDED.discount_amount;
