import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Loader2, Save, X, Store, Clock, ChefHat, CheckCircle2, CreditCard, LayoutDashboard, UtensilsCrossed, Package, MapPin, Upload, Star, ThumbsUp, ThumbsDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { AdminShell } from "@/components/admin-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Outlet Dashboard — LNR Admin" }, { name: "robots", content: "noindex" }] }),
  component: OutletDashboard,
});

// --- TYPES ---
export type MenuOptionChoice = { name: string; price_diff: number };
export type MenuOptionGroup = { name: string; type: "wajib" | "opsional"; choices: MenuOptionChoice[] };

export type MenuItem = {
  id: string;
  name: string;
  category: "coffee" | "hot-coffee" | "americano" | "non-coffee" | "snack" | "makanan" | "tumbler";
  price: number;
  description: string;
  image_url: string | null;
  available_branches?: string[];
  // Legacy fields below (can be ignored)
  available_kemang?: boolean;
  available_senopati?: boolean;
  options: MenuOptionGroup[] | null;
  // Legacy fields below (can be ignored)
  available?: boolean;
  branch?: string;
};

type OrderItem = { id: string; name: string; price: number; qty: number; note: string | null };
type Order = {
  id: string;
  table_number: number;
  status: "pending" | "cooking" | "served" | "paid" | "cancelled";
  total: number;
  note: string | null;
  created_at: string;
  branch: string;
  order_type?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  driver_type?: string;
  payment_channel?: string;
  order_items: OrderItem[];
};

export const PRESET_OPTIONS: MenuOptionGroup[] = [
  { name: "Ukuran Cup", type: "wajib", choices: [{ name: "Regular Ice", price_diff: 0 }, { name: "Large Ice", price_diff: 7000 }] },
  { name: "Sweetness", type: "wajib", choices: [{ name: "Normal Sweet", price_diff: 0 }, { name: "Less Sweet", price_diff: 0 }] },
  { name: "Ice Cube", type: "wajib", choices: [{ name: "Normal Ice", price_diff: 0 }, { name: "Less Ice", price_diff: 0 }, { name: "More Ice", price_diff: 0 }] },
  { name: "Espresso", type: "wajib", choices: [{ name: "Normal Shot", price_diff: 0 }, { name: "+1 Shot", price_diff: 7000 }, { name: "+2 Shot", price_diff: 14000 }] },
  { name: "Syrup", type: "opsional", choices: [{ name: "Aren", price_diff: 7000 }, { name: "Manuka", price_diff: 7000 }, { name: "Vanilla", price_diff: 7000 }, { name: "Salted Caramel", price_diff: 7000 }] }
];

export const CATS = ["coffee", "hot-coffee", "americano", "non-coffee", "snack", "makanan", "tumbler"] as const;
const STATUS_STYLES: Record<Order["status"], { border: string; label: string; chip: string }> = {
  pending:   { border: "border-l-destructive",           label: "Blm Dibayar", chip: "bg-destructive/10 text-destructive" },
  paid:      { border: "border-l-[oklch(0.7_0.17_55)]", label: "Di proses",  chip: "bg-[oklch(0.7_0.17_55/0.2)] text-[oklch(0.55_0.17_55)]" },
  cooking:   { border: "border-l-accent",                label: "Pesanan Dibuat", chip: "bg-accent/20 text-accent" },
  served:    { border: "border-l-[oklch(0.6_0.13_150)]", label: "Siap / Dikirim", chip: "bg-[oklch(0.6_0.13_150/0.2)] text-[oklch(0.45_0.13_150)]" },
  completed: { border: "border-l-muted",                 label: "Selesai",     chip: "bg-muted text-muted-foreground" },
  cancelled: { border: "border-l-destructive",           label: "Batal",     chip: "bg-destructive/10 text-destructive" },
};

function OutletDashboard() {
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pickup" | "delivery" | "menu" | "ulasan">("pickup");

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
      </div>

      {activeTab === "pickup" && <OrderBoard branch={activeBranch} type={98} />}
      {activeTab === "delivery" && <OrderBoard branch={activeBranch} type={99} />}
      {activeTab === "menu" && <MenuManager branch={activeBranch} />}
      {activeTab === "ulasan" && <ReviewBoard branch={activeBranch} />}
    </AdminShell>
  );
}

// --- ORDER BOARD COMPONENT ---
function OrderBoard({ branch, type }: { branch: string, type: 98 | 99 }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const initialised = useRef(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("branch", branch)
      .eq("table_number", type)
      .in("status", ["paid", "cooking", "served", "completed"])
      .order("created_at", { ascending: true });
    
    if (error) toast.error(error.message);
    else setOrders(data as Order[]);
  };

  useEffect(() => {
    setOrders(null);
    load();
    const ch = supabase
      .channel(`orders-${branch}-${type}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        const newOrder = payload.new as any;
        const oldOrder = payload.old as any;
        
        if (payload.eventType === "INSERT" && initialised.current && newOrder.branch === branch && newOrder.table_number === type) {
          if (newOrder.status === "cooking") {
            try { new Audio("data:audio/wav;base64,UklGRl9vAACAAAAAAQABAESsAACAfQAAAgAQAGRhdGE=").play().catch(()=>{}); } catch {}
            toast.info(`Pesanan ${type === 98 ? 'Pick Up' : 'Delivery'} baru masuk!`);
          }
        } 
        else if (payload.eventType === "UPDATE" && initialised.current && newOrder.branch === branch && newOrder.table_number === type) {
          // Trigger notification if it just changed to cooking (e.g. user simulated payment)
          if (newOrder.status === "cooking") {
            try { new Audio("data:audio/wav;base64,UklGRl9vAACAAAAAAQABAESsAACAfQAAAgAQAGRhdGE=").play().catch(()=>{}); } catch {}
            toast.success(`Pesanan ${type === 98 ? 'Pick Up' : 'Delivery'} baru dibayar dan masuk ke dapur!`);
          }
        }
        
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => load())
      .subscribe(() => { initialised.current = true; });
    return () => { supabase.removeChannel(ch); };
  }, [branch, type]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    setUpdating(id);
    
    // Optimistic update
    setOrders(prev => {
      if (!prev) return prev;
      if (status === "pending") {
         return prev.filter(o => o.id !== id); // Remove from active board
      }
      return prev.map(o => o.id === id ? { ...o, status } : o);
    });

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      load(); // Revert on error
    } else {
      toast.success(`Status diperbarui`);
    }
    setUpdating(null);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pesanan ini secara permanen?")) return;
    setUpdating(id);
    
    // Optimistic update
    setOrders(prev => prev ? prev.filter(o => o.id !== id) : prev);

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      load(); // Revert on error
    } else {
      toast.success("Pesanan berhasil dihapus");
    }
    setUpdating(null);
  };

  if (orders === null) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-card" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
        <CheckCircle2 className="mb-3 size-10 text-accent" />
        <p className="font-display text-lg font-semibold">Semua bersih ✨</p>
        <p className="text-sm text-muted-foreground">Tidak ada pesanan {type === 98 ? 'Pick Up' : 'Delivery'} yang aktif.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-secondary/30 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Waktu</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Nomer pesanan</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Nama Pemesan</th>
            <th className="px-4 py-3 font-medium">Pesanan</th>
            <th className="px-4 py-3 font-medium">Detail pesanan</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((o, index) => {
            const s = STATUS_STYLES[o.status];
            const isDelivery = o.table_number === 99;
            const orderNumber = index + 1;
            
            // Clean up old note format and extract old data if missing
            let displayNote = o.note;
            let displayCustomerName = o.customer_name;
            let displayCustomerPhone = o.customer_phone;
            
            if (displayNote?.includes("| Name: ")) {
              // Format was: "DELIVERY | Name: xxx | Phone: yyy | Note: zzz"
              const matchName = displayNote.match(/\| Name: (.*?)(?: \||$)/);
              const matchPhone = displayNote.match(/\| Phone: (.*?)(?: \||$)/);
              const matchNote = displayNote.match(/\| Note: (.*)$/);
              
              if (!displayCustomerName && matchName) displayCustomerName = matchName[1];
              if (!displayCustomerPhone && matchPhone) displayCustomerPhone = matchPhone[1];
              displayNote = matchNote ? matchNote[1] : "";
            }
            
            return (
              <tr key={o.id} className="hover:bg-secondary/10 transition-colors">
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-medium mt-0.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    {new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    {isDelivery ? <MapPin className="size-3.5 text-muted-foreground" /> : <Package className="size-3.5 text-muted-foreground" />}
                    #{orderNumber}
                  </div>
                </td>
                
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <div className="font-semibold text-foreground">{displayCustomerName || "Guest"}</div>
                  {displayCustomerPhone && (
                    <div className="mt-1 text-[11px] text-muted-foreground">{displayCustomerPhone}</div>
                  )}
                </td>

                <td className="px-4 py-3 align-top min-w-[200px]">
                  <ul className="space-y-1">
                    {o.order_items.map((it) => {
                      const match = it.name.match(/^(.*?)\s*\((.*)\)$/);
                      const baseName = match ? match[1] : it.name;
                      return (
                        <li key={it.id} className="flex flex-col">
                          <span className="font-medium text-foreground"><span className="text-accent">{it.qty}×</span> {baseName}</span>
                          {it.note && <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground whitespace-pre-line">- {it.note}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </td>

                <td className="px-4 py-3 align-top max-w-[250px] text-xs text-muted-foreground">
                  <div className="flex flex-col items-start gap-2">
                    {displayNote ? <div className="truncate w-full">{displayNote}</div> : <span>-</span>}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline">Selengkapnya</button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detail Pesanan #{orderNumber}</DialogTitle>
                        </DialogHeader>
                          <div className="space-y-4 py-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-muted-foreground">Status</span>
                              <span className="col-span-2 font-bold">{STATUS_STYLES[o.status]?.label || o.status}</span>
                            </div>
                            
                            {displayCustomerName && (
                              <>
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="text-muted-foreground">Penerima</span>
                                  <span className="col-span-2 font-semibold">{displayCustomerName}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="text-muted-foreground">Nomor WA</span>
                                  <span className="col-span-2 font-semibold">{displayCustomerPhone}</span>
                                </div>
                              </>
                            )}
                            
                            {o.customer_address && (
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Alamat</span>
                                <span className="col-span-2">{o.customer_address}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-muted-foreground">Tipe</span>
                              <span className="col-span-2 uppercase font-semibold">{isDelivery ? "Delivery" : (o.order_type || "Dine In")}</span>
                            </div>

                            {o.driver_type && (
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Pengiriman</span>
                                <span className="col-span-2 uppercase font-semibold">{o.driver_type}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-muted-foreground">Catatan</span>
                              <span className="col-span-2 whitespace-pre-line">{displayNote}</span>
                            </div>

                            <div className="mt-4 border-t pt-4">
                              <h4 className="font-semibold mb-2">Daftar Menu</h4>
                              <ul className="space-y-3">
                                {o.order_items.map(it => {
                                  // Extract options if they were appended to the name like "Name (Option1: X | Option2: Y)"
                                  const match = it.name.match(/^(.*?)\s*\((.*)\)$/);
                                  const baseName = match ? match[1] : it.name;
                                  const notePart = match ? match[2] : "";
                                  
                                  return (
                                    <li key={it.id} className="flex flex-col">
                                      <div className="flex justify-between">
                                        <span className="font-semibold">{it.qty}x {baseName}</span>
                                        <span>{formatRupiah(it.price * it.qty)}</span>
                                      </div>
                                      {notePart && (
                                        <div className="mt-1 pl-5 text-sm text-muted-foreground border-l-2 border-border ml-1">
                                          <ul className="space-y-1">
                                            {notePart.split(" | ").map((opt, i) => (
                                              <li key={i} className="flex items-start gap-1.5">
                                                <span className="text-accent/60">•</span> {opt}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="flex justify-between font-bold mt-3 pt-3 border-t text-accent">
                                <span>Total</span>
                                <span>{formatRupiah(o.total)}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                  </div>
                </td>

                <td className="px-4 py-3 align-top font-display font-bold text-accent whitespace-nowrap">
                  {formatRupiah(o.total)}
                </td>

                <td className="px-4 py-3 align-top whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.chip}`}>
                    {s.label}
                  </span>
                </td>

                <td className="px-4 py-3 align-top text-right">
                  <div className="flex flex-col gap-2 items-end justify-end">
                    <div className="flex items-center gap-2">
                      <select 
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) => updateStatus(o.id, e.target.value as Order["status"])}
                      >
                        <option value="paid">Di proses</option>
                        <option value="cooking">Pesanan Dibuat</option>
                        {isDelivery && <option value="served">Dikirim driver</option>}
                        {o.table_number !== 98 && o.table_number !== 99 && <option value="served">Siap Diantar ke Meja</option>}
                        <option value="completed">Pesanan selesai</option>
                      </select>

                      <button 
                        onClick={() => deleteOrder(o.id)}
                        disabled={updating === o.id}
                        title="Hapus Pesanan"
                        className="rounded-lg border border-destructive/20 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- OUTLET MENU MANAGER COMPONENT ---
function MenuManager({ branch }: { branch: string }) {
  const [items, setItems] = useState<MenuItem[] | null>(null);

  const load = async () => {
    setItems(null);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("name");
    
    if (error) toast.error(error.message);
    else setItems(data as MenuItem[]);
  };

  useEffect(() => { load(); }, [branch]);

  const toggleAvail = async (it: MenuItem) => {
    const branches = it.available_branches || [];
    const isCurrentlyAvail = branches.includes(branch);
    
    let newBranches;
    if (isCurrentlyAvail) {
      newBranches = branches.filter(b => b !== branch);
    } else {
      newBranches = [...branches, branch];
    }
    
    const { error } = await supabase.from("menu_items").update({ available_branches: newBranches }).eq("id", it.id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div>
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong className="block mb-1">Informasi:</strong>
        Di sini Anda hanya dapat mengatur ketersediaan (Tersedia/Habis) untuk cabang terpilih. Untuk menambah, mengedit, atau menghapus menu, silakan gunakan fitur <b>Master Admin</b>.
      </div>

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {CATS.map((c) => {
            const list = items.filter((i) => i.category === c);
            return (
              <section key={c}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{c}</h2>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {list.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Belum ada menu di kategori ini.</div>}
                  {list.map((it, idx) => {
                    const isAvailable = (it.available_branches || []).includes(branch);
                    
                    return (
                      <div key={it.id} className={`flex flex-wrap items-center gap-4 p-4 ${idx > 0 ? "border-t border-border" : ""}`}>
                        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-accent/15">
                          <img 
                            src={it.image_url || `/images/${it.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `/images/${it.category}.png`; }}
                            alt={it.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{it.name}</span>
                            {!isAvailable && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">Habis</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</div>
                        </div>
                        <div className="font-display font-bold text-accent pr-4">{formatRupiah(it.price)}</div>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold rounded-lg bg-secondary px-3 py-2 hover:bg-accent/10 transition">
                          <input type="checkbox" checked={isAvailable} onChange={() => toggleAvail(it)} className="accent-[color:var(--accent)] size-4" />
                          {isAvailable ? 'Tersedia' : 'Habis'}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Btn({ children, icon, onClick, loading, variant = "secondary" }: { children: React.ReactNode; icon?: React.ReactNode; onClick: () => void; loading?: boolean; variant?: "primary" | "secondary" }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50";
  const v = variant === "primary"
    ? "bg-primary text-primary-foreground hover:opacity-90"
    : "bg-secondary text-foreground hover:bg-accent/30";
  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${v}`}>
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// --- REVIEW BOARD COMPONENT ---
function ReviewBoard({ branch }: { branch: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        // Find branch id first since branch is a slug "kemang" or "senopati"
        const { data: bData } = await supabase.from("branches").select("id").eq("slug", branch).single();
        if (!bData) return;
        
        const { data, error } = await supabase
          .from("reviews")
          .select("*, orders(customer_name, id, created_at)")
          .eq("branch_id", bData.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error("Error fetching reviews", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [branch]);

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
        <Star className="size-12 text-muted-foreground opacity-20" />
        <div>
          <h3 className="font-semibold text-lg">Belum ada ulasan</h3>
          <p className="text-sm text-muted-foreground">Ulasan dari pelanggan cabang ini akan muncul di sini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((r) => (
        <div key={r.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
           <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-base">{r.orders?.customer_name || "Pelanggan LNR"}</div>
                <div className="text-xs text-muted-foreground">Order #{r.order_id?.slice(0,8).toUpperCase()}</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{r.rating}</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
           </div>
           
           {r.tags && r.tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mb-3">
               {r.tags.map((tag: string, i: number) => (
                 <span key={i} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                   {tag}
                 </span>
               ))}
             </div>
           )}
           
           {r.comment && (
             <div className="mb-4 text-sm italic text-muted-foreground bg-accent/30 p-3 rounded-lg border border-border/50">
               "{r.comment}"
             </div>
           )}
           
           {r.product_ratings && r.product_ratings.length > 0 && (
             <div className="border-t border-border/50 pt-3 mt-auto">
               <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Produk</div>
               <div className="space-y-1.5">
                 {r.product_ratings.map((pr: any, i: number) => (
                   <div key={i} className="flex justify-between items-center text-xs">
                     <span className="truncate pr-2">{pr.name}</span>
                     <div className="shrink-0">
                       {pr.liked ? (
                         <span className="flex items-center gap-1 text-primary font-medium"><ThumbsUp className="size-3 fill-primary" /> Puas</span>
                       ) : (
                         <span className="flex items-center gap-1 text-destructive font-medium"><ThumbsDown className="size-3 fill-destructive" /> Tdk Puas</span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      ))}
    </div>
  );
}
