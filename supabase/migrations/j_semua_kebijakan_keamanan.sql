-- Mengaktifkan RLS untuk semua tabel
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- Policy Publik (Dapat diakses anonim)
CREATE POLICY "Public read menu_items" ON public.menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Public read branches" ON public.branches FOR SELECT TO public USING (true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT TO public USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Public read vouchers" ON public.vouchers FOR SELECT TO public USING (true);
CREATE POLICY "Public read master_admin_settings" ON public.master_admin_settings FOR SELECT TO public USING (true);

-- Policy Insert & Update Publik
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE TO public USING (true);
CREATE POLICY "Public read orders" ON public.orders FOR SELECT TO public USING (true);

CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT TO public USING (true);

CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE TO public USING (true);

CREATE POLICY "Public insert login_sessions" ON public.login_sessions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update login_sessions" ON public.login_sessions FOR UPDATE TO public USING (true);
CREATE POLICY "Public read login_sessions" ON public.login_sessions FOR SELECT TO public USING (true);

-- Service Role (Full Access)
CREATE POLICY "Service Role full access menu_items" ON public.menu_items FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access branches" ON public.branches FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access orders" ON public.orders FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access order_items" ON public.order_items FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access reviews" ON public.reviews FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access profiles" ON public.profiles FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access vouchers" ON public.vouchers FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access master_admin_settings" ON public.master_admin_settings FOR ALL TO service_role USING (true);
CREATE POLICY "Service Role full access login_sessions" ON public.login_sessions FOR ALL TO service_role USING (true);
