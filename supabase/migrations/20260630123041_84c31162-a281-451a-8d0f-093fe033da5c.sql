
-- MENU ITEMS
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('coffee','non-coffee','snack')),
  price integer NOT NULL CHECK (price >= 0),
  description text NOT NULL DEFAULT '',
  image_url text,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert menu"
  ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu"
  ON public.menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete menu"
  ON public.menu_items FOR DELETE TO authenticated USING (true);

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL CHECK (table_number BETWEEN 1 AND 30),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cooking','served','paid','cancelled')),
  total integer NOT NULL CHECK (total >= 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update orders" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete orders" ON public.orders FOR DELETE TO authenticated USING (true);

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  price integer NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  note text
);
GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view order items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update order items" ON public.order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete order items" ON public.order_items FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_orders_status_created ON public.orders (status, created_at);
CREATE INDEX idx_order_items_order ON public.order_items (order_id);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- SEED
INSERT INTO public.menu_items (name, category, price, description) VALUES
('Espresso','coffee',18000,'Single shot espresso'),
('Americano','coffee',20000,'Espresso + air panas'),
('Kopi Susu LNR','coffee',25000,'Signature kopi susu gula aren'),
('Cappuccino','coffee',27000,'Espresso, susu steamed, foam'),
('Latte','coffee',27000,'Espresso dengan susu lembut'),
('Matcha Latte','non-coffee',28000,'Matcha premium dengan susu'),
('Chocolate','non-coffee',25000,'Coklat panas/dingin'),
('Lemon Tea','non-coffee',18000,'Teh lemon segar'),
('Croissant','snack',22000,'Croissant butter renyah'),
('French Fries','snack',20000,'Kentang goreng renyah'),
('Banana Bread','snack',18000,'Banana bread homemade');
