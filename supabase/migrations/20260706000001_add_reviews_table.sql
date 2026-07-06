CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[] DEFAULT '{}',
    comment TEXT,
    product_ratings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua orang dapat membaca review" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Publik dapat membuat review" ON public.reviews
    FOR INSERT WITH CHECK (true);
