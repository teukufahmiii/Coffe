import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Coffee, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Login Admin — LNR" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Registrasi Sesi Login
      try {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(async (geo) => {
            const { data: session } = await supabase.from('login_sessions').insert({
              user_type: 'admin',
              identifier: email,
              ip_address: geo.ip || 'Unknown',
              location: geo.city && geo.region ? `${geo.city}, ${geo.region}` : 'Unknown',
              user_agent: navigator.userAgent
            }).select('id').single();
            
            if (session) {
              localStorage.setItem('admin_session_id', session.id);
            }
          })
          .catch(async () => {
            const { data: session } = await supabase.from('login_sessions').insert({
              user_type: 'admin',
              identifier: email,
              ip_address: 'Unknown',
              location: 'Unknown',
              user_agent: navigator.userAgent
            }).select('id').single();
            
            if (session) {
              localStorage.setItem('admin_session_id', session.id);
            }
          });
      } catch (e) {
        console.error("Gagal mencatat sesi", e);
      }

      toast.success("Selamat datang kembali");
      navigate({ to: "/admin" });
    } catch (e: any) {
      toast.error("Gagal Login", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-warm">
        <Link to="/" className="mb-6 flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
          <img src="/images/LOGO_LNR.png" alt="LNR Logo" className="h-8 object-contain" />
          <span className="font-display font-bold text-foreground">Admin Portal</span>
        </Link>
        <h1 className="font-display text-2xl font-bold">Masuk Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Akses dashboard kasir & manajemen menu.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
