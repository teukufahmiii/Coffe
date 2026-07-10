import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Coffee, LayoutDashboard, QrCode, LogOut, Package, Store, BellRing, Ticket, ShieldCheck, Globe, Users, ChevronDown, Settings, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import type { ReactNode } from "react";

const KELOLA_LINKS = [
  { tab: "website", label: "Kelola Banner", icon: Globe },
  { tab: "vouchers", label: "Kelola Voucher", icon: Ticket },
  { tab: "qr", label: "QR Website", icon: QrCode },
  { tab: "menu", label: "Kelola Menu", icon: Coffee },
  { tab: "users", label: "Pengguna", icon: Users },
  { tab: "notifications", label: "Notifikasi", icon: BellRing },
];

const LOGIN_LINKS = [
  { tab: "activity", label: "Aktivitas Login" },
  { tab: "finance", label: "Laporan Keuangan" },
  { tab: "developer", label: "Dashboard Developer" },
  { tab: "outlet", label: "Dashboard Outlet" },
  { tab: "master", label: "Master Admin" },
  { tab: "password", label: "Password Admin" },
];

export function MasterAdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => (s.location.search as any) || {} });
  
  const currentTab = search.tab || "website";
  const loginTab = search.tab || "activity";
  
  const [isKelolaOpen, setIsKelolaOpen] = useState(pathname.startsWith("/master/settings"));
  const [isLoginOpen, setIsLoginOpen] = useState(pathname.startsWith("/master/login"));

  const signOut = async () => {
    // Clear master admin session
    sessionStorage.removeItem("master_admin_verified");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-background p-5 md:flex">
        <Link to="/master" className="mb-8 flex items-center gap-2 text-primary">
          <ShieldCheck className="size-6 text-primary" />
          <span className="font-display text-lg font-bold leading-tight">Master<br/>Admin</span>
        </Link>
        <nav className="flex-1 space-y-1">
          <Link
            to="/master"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/master" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent/20"
            }`}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>

          <Link
            to="/master/outlets"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith("/master/outlets") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent/20"
            }`}
          >
            <Store className="size-4" />
            Kelola Outlet
          </Link>

          {/* Kelola Website Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => setIsKelolaOpen(!isKelolaOpen)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                pathname.startsWith("/master/settings") && !isKelolaOpen ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="size-4" />
                Kelola Website
              </div>
              <ChevronDown className={`size-4 transition-transform ${isKelolaOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isKelolaOpen && (
              <div className="mt-1 flex flex-col space-y-1 pl-4">
                {KELOLA_LINKS.map((l) => {
                  const active = pathname.startsWith("/master/settings") && currentTab === l.tab;
                  return (
                    <Link
                      key={l.tab}
                      to="/master/settings"
                      search={{ tab: l.tab }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      }`}
                    >
                      <l.icon className="size-3.5" />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kelola Login Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => setIsLoginOpen(!isLoginOpen)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                pathname.startsWith("/master/login") && !isLoginOpen ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4" />
                Kelola Login
              </div>
              <ChevronDown className={`size-4 transition-transform ${isLoginOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isLoginOpen && (
              <div className="mt-1 flex flex-col space-y-1 pl-4">
                {LOGIN_LINKS.map((l) => {
                  const active = pathname.startsWith("/master/login") && loginTab === l.tab;
                  return (
                    <Link
                      key={l.tab}
                      to="/master/login"
                      search={{ tab: l.tab }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="size-4" /> Keluar ke Admin
        </button>
      </aside>

      {/* MOBILE TOP NAV */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Link to="/master" className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" />
          <span className="font-display text-lg font-bold">Master Admin</span>
        </Link>
        <button onClick={signOut} className="text-xs font-semibold text-destructive">Keluar</button>
      </header>
      <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-background px-4 py-2 md:hidden">
        <Link 
          to="/master"
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${pathname === "/master" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          <LayoutDashboard className="size-3.5" /> Dashboard
        </Link>
        <Link 
          to="/master/outlets"
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${pathname.startsWith("/master/outlets") ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          <Store className="size-3.5" /> Kelola Outlet
        </Link>
        <Link 
          to="/master/settings"
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${pathname.startsWith("/master/settings") && !pathname.startsWith("/master/pengaturan") ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          <Globe className="size-3.5" /> Kelola Website
        </Link>
        <Link 
          to="/master/login"
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${pathname.startsWith("/master/login") ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          <ShieldCheck className="size-3.5" /> Kelola Login
        </Link>
      </nav>

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
