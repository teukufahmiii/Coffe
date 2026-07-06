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

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branches visible to all" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Branches insertable by all" ON public.branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Branches updatable by all" ON public.branches FOR UPDATE USING (true);

-- Seed data for branches
INSERT INTO public.branches (name, slug, address, latitude, longitude) VALUES
('LNR Coffee Kemang', 'kemang', 'Jl. Kemang Raya No. 12, Jakarta Selatan', -6.2615, 106.8160),
('LNR Coffee Senopati', 'senopati', 'Jl. Senopati No. 45, Jakarta Selatan', -6.2290, 106.8100)
ON CONFLICT (slug) DO NOTHING;
