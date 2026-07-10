CREATE TABLE IF NOT EXISTS public.master_admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pin TEXT NOT NULL DEFAULT '123456',
  developer_pin TEXT DEFAULT 'dev123',
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.master_admin_settings (id, pin, developer_pin) VALUES (1, '123456', 'dev123') ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.verify_master_admin_pin(p_pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.master_admin_settings WHERE id = 1 AND pin = p_pin);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_master_admin_pin(p_new_pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF length(p_new_pin) != 6 THEN
    RAISE EXCEPTION 'PIN harus 6 karakter';
  END IF;
  UPDATE public.master_admin_settings SET pin = p_new_pin, updated_at = now() WHERE id = 1;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
