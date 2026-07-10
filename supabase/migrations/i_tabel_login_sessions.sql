CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_type TEXT NOT NULL,
  identifier TEXT,
  ip_address TEXT,
  location TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  login_time TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now()
);
