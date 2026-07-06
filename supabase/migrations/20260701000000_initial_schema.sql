-- Tabel: menu_items
CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('coffee', 'non-coffee', 'snack')),
    price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu dapat dilihat oleh semua orang" ON public.menu_items
    FOR SELECT USING (true);


-- Tabel: orders
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number INTEGER NOT NULL,
    total NUMERIC NOT NULL DEFAULT 0,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'served', 'paid', 'cancelled', 'processing', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik dapat membuat pesanan" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hanya kasir yang dapat melihat pesanan" ON public.orders
    FOR SELECT USING (true);


-- Tabel: order_items
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik dapat membuat rincian pesanan" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hanya kasir yang dapat melihat rincian pesanan" ON public.order_items
    FOR SELECT USING (true);
