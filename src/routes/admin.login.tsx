import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Coffee } from "lucide-react";
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
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Coffee className="size-4 text-accent" />
          <span className="font-display text-lg font-bold text-foreground">LNR</span>
          <span>· Admin</span>
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
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
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
