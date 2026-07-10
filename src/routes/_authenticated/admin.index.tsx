import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Store, ChefHat, Package, UtensilsCrossed, Star, DollarSign, ChevronRight, Calculator } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin-shell";
import { OutletFinanceBoard } from "@/components/admin/OutletFinanceBoard";
import { DashboardPesananAktif } from "@/components/admin/dashboard/DashboardPesananAktif";
import { MenuManager } from "@/components/admin/dashboard/MenuManager";
import { ReviewBoard } from "@/components/admin/dashboard/ReviewBoard";
import { PosSystem } from "@/components/admin/dashboard/PosSystem";
import { PinGuard } from "@/components/PinGuard";
import { QrManager } from "@/components/admin/settings/QrManager";
import { QrCode } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Outlet Dashboard — LNR Admin" }, { name: "robots", content: "noindex" }] }),
  component: OutletDashboard,
});

function OutletDashboard() {
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"kasir" | "pickup" | "delivery" | "menu" | "ulasan" | "finance" | "qr">("kasir");

  const [outlets, setOutlets] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("branches").select("*").order("name").then(({ data }) => {
      if (data) setOutlets(data);
    });
  }, []);

  const filteredOutlets = outlets.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // 1. OUTLET SELECTION SCREEN
  if (!activeBranch) {
    return (
      <AdminShell>
        <div className="max-w-3xl mx-auto py-10">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-primary mb-3">Pilih Outlet</h1>
            <p className="text-muted-foreground">Silakan pilih cabang outlet yang ingin Anda kelola</p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <input
              type="text"
              placeholder="Cari nama outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-black/10 bg-white shadow-sm focus:border-primary focus:outline-none transition-colors text-lg"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredOutlets.map((outlet) => (
              <button
                key={outlet.id}
                onClick={() => setActiveBranch(outlet.slug)}
                className="flex items-center justify-between bg-white p-6 rounded-3xl border-2 border-black/10 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="flex flex-col items-start text-left">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Store className="size-6" />
                  </div>
                    <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors">{outlet.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{outlet.address}</p>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>
            ))}
            
            {filteredOutlets.length === 0 && (
              <div className="col-span-full text-center py-10 bg-white/50 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">Outlet tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </AdminShell>
    );
  }

  const activeOutlet = outlets.find(o => o.slug === activeBranch);
  const selectedOutletName = activeOutlet?.name;
  const isOutletActive = activeOutlet?.is_active ?? true;

  const toggleOutletStatus = async () => {
    if (!activeBranch) return;
    const newStatus = !isOutletActive;
    
    // Optimistic update
    setOutlets(prev => prev.map(o => o.slug === activeBranch ? { ...o, is_active: newStatus } : o));
    
    const { error } = await supabase.from("branches").update({ is_active: newStatus }).eq("slug", activeBranch);
    if (error) {
       toast.error(error.message);
       // Revert
       setOutlets(prev => prev.map(o => o.slug === activeBranch ? { ...o, is_active: !newStatus } : o));
    } else {
       toast.success(`Toko berhasil ${newStatus ? 'dibuka' : 'ditutup'}`);
    }
  };

  // 2. MAIN DASHBOARD SCREEN
  return (
    <PinGuard 
      title={`Akses Outlet: ${selectedOutletName}`} 
      pinType="outlet" 
      outletSlug={activeBranch}
      onBack={() => setActiveBranch(null)}
      onSuccess={() => {}} 
    >
      <AdminShell>
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1 ${isOutletActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              <Store className="size-3" /> {selectedOutletName} {isOutletActive ? '' : '(TUTUP)'}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold">Outlet Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pesanan dan menu untuk {selectedOutletName}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeOutlet && (
            <button
              onClick={toggleOutletStatus}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 shadow-sm text-sm font-bold transition-all ${isOutletActive ? 'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white' : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
            >
              {isOutletActive ? 'Tutup Toko' : 'Buka Toko'}
            </button>
          )}
          <button 
            onClick={() => setActiveBranch(null)}
            className="flex items-center gap-2 rounded-xl border-2 border-black/10 bg-white px-4 py-2 shadow-sm text-sm font-bold text-primary hover:bg-accent/5 hover:border-primary/30 transition-all"
          >
            Ganti Outlet <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border pb-px overflow-x-auto">
        <button 
          onClick={() => setActiveTab("kasir")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "kasir" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Calculator className="size-4" /> Kasir (POS)
        </button>
        <button 
          onClick={() => setActiveTab("pickup")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "pickup" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <ChefHat className="size-4" /> Barista Command Center (Pick Up)
        </button>
        <button 
          onClick={() => setActiveTab("delivery")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "delivery" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Package className="size-4" /> Dispatcher Board (Delivery)
        </button>
        <button 
          onClick={() => setActiveTab("menu")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "menu" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <UtensilsCrossed className="size-4" /> Kelola Menu
        </button>
        <button 
          onClick={() => setActiveTab("ulasan")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "ulasan" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Star className="size-4" /> Ulasan Pelanggan
        </button>
        <button 
          onClick={() => setActiveTab("finance")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "finance" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <DollarSign className="size-4" /> Keuangan Outlet
        </button>
        <button 
          onClick={() => setActiveTab("qr")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "qr" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <QrCode className="size-4" /> QR Website
        </button>
      </div>

      {activeTab === "kasir" && <PosSystem branch={activeOutlet} />}
      {activeTab === "pickup" && <DashboardPesananAktif branch={activeBranch} type={98} />}
      {activeTab === "delivery" && <DashboardPesananAktif branch={activeBranch} type={99} />}
      {activeTab === "menu" && <MenuManager branch={activeBranch} />}
      {activeTab === "ulasan" && <ReviewBoard branch={activeBranch} />}
      {activeTab === "finance" && <OutletFinanceBoard branch={activeBranch} />}
      {activeTab === "qr" && <QrManager />}
      </AdminShell>
    </PinGuard>
  );
}
