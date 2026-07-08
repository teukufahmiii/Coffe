import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Coffee, LayoutDashboard, QrCode, LogOut, Package, Store, BellRing, Ticket, ShieldCheck, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReactNode } from "react";

const LINKS = [
  { to: "/admin/settings", label: "Master Admin", icon: ShieldCheck },
  { to: "/admin", label: "Outlet Dashboard", icon: Store },
  { to: "/admin/finance", label: "Laporan Keuangan", icon: BarChart3 },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sampai jumpa!");
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-background p-5 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <Coffee className="size-5 text-accent" />
          <span className="font-display text-xl font-bold">LNR</span>
          <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {LINKS.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent/20"
                }`}
              >
                <l.icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="size-4" /> Keluar
        </button>
      </aside>

      {/* MOBILE TOP NAV */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Coffee className="size-5 text-accent" />
          <span className="font-display text-lg font-bold">LNR Admin</span>
        </Link>
        <button onClick={signOut} className="text-xs font-semibold text-destructive">Keluar</button>
      </header>
      <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-background px-4 py-2 md:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.to;
          return (
            <Link key={l.to} to={l.to} className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              <l.icon className="size-3.5" /> {l.label}
            </Link>
          );
        })}
      </nav>

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
