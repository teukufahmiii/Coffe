import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X, Store, Clock, ChefHat, CheckCircle2, CreditCard, LayoutDashboard, UtensilsCrossed, Package, MapPin, Upload, Star, ThumbsUp, ThumbsDown } from "lucide-react";
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

type MenuItem = {
  id: string;
  name: string;
  category: "coffee" | "non-coffee" | "snack" | "makanan";
  price: number;
  description: string;
  image_url: string | null;
  available: boolean;
  branch: string;
  options: MenuOptionGroup[] | null;
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

const PRESET_OPTIONS: MenuOptionGroup[] = [
  { name: "Ukuran Cup", type: "wajib", choices: [{ name: "Regular Ice", price_diff: 0 }, { name: "Large Ice", price_diff: 7000 }] },
  { name: "Sweetness", type: "wajib", choices: [{ name: "Normal Sweet", price_diff: 0 }, { name: "Less Sweet", price_diff: 0 }] },
  { name: "Ice Cube", type: "wajib", choices: [{ name: "Normal Ice", price_diff: 0 }, { name: "Less Ice", price_diff: 0 }, { name: "More Ice", price_diff: 0 }] },
  { name: "Espresso", type: "wajib", choices: [{ name: "Normal Shot", price_diff: 0 }, { name: "+1 Shot", price_diff: 7000 }, { name: "+2 Shot", price_diff: 14000 }] },
  { name: "Syrup", type: "opsional", choices: [{ name: "Aren", price_diff: 7000 }, { name: "Manuka", price_diff: 7000 }, { name: "Vanilla", price_diff: 7000 }, { name: "Salted Caramel", price_diff: 7000 }] }
];

const CATS = ["coffee", "non-coffee", "snack", "makanan"] as const;
const STATUS_STYLES: Record<Order["status"], { border: string; label: string; chip: string }> = {
  pending:   { border: "border-l-destructive",           label: "Blm Dibayar", chip: "bg-destructive/10 text-destructive" },
  paid:      { border: "border-l-[oklch(0.7_0.17_55)]", label: "Di proses",  chip: "bg-[oklch(0.7_0.17_55/0.2)] text-[oklch(0.55_0.17_55)]" },
  cooking:   { border: "border-l-accent",                label: "Pesanan Dibuat", chip: "bg-accent/20 text-accent" },
  served:    { border: "border-l-[oklch(0.6_0.13_150)]", label: "Siap / Dikirim", chip: "bg-[oklch(0.6_0.13_150/0.2)] text-[oklch(0.45_0.13_150)]" },
  completed: { border: "border-l-muted",                 label: "Selesai",     chip: "bg-muted text-muted-foreground" },
  cancelled: { border: "border-l-destructive",           label: "Batal",     chip: "bg-destructive/10 text-destructive" },
};

function OutletDashboard() {
  const [activeBranch, setActiveBranch] = useState("kemang");
  const [activeTab, setActiveTab] = useState<"pickup" | "delivery" | "menu" | "ulasan">("pickup");

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Outlet Dashboard</h1>
          <p className="text-sm text-muted-foreground">Kelola pesanan dan menu per cabang.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm">
            <Store className="size-4 text-muted-foreground" />
            <select 
              value={activeBranch} 
              onChange={(e) => setActiveBranch(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none"
            >
              <option value="kemang">Cabang Kemang</option>
              <option value="senopati">Cabang Senopati</option>
            </select>
          </div>
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
            <th className="px-4 py-3 font-medium whitespace-nowrap">ID & Waktu</th>
            <th className="px-4 py-3 font-medium">Pesanan</th>
            <th className="px-4 py-3 font-medium">Catatan</th>
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
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    {isDelivery ? <MapPin className="size-3.5 text-muted-foreground" /> : <Package className="size-3.5 text-muted-foreground" />}
                    #{orderNumber}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                
                <td className="px-4 py-3 align-top min-w-[200px]">
                  <ul className="space-y-1">
                    {o.order_items.map((it) => (
                      <li key={it.id} className="flex flex-col">
                        <span className="font-medium text-foreground"><span className="text-accent">{it.qty}×</span> {it.name}</span>
                        {it.note && <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground whitespace-pre-line">- {it.note}</span>}
                      </li>
                    ))}
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

// --- MENU MANAGER COMPONENT ---
function MenuManager({ branch }: { branch: string }) {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setItems(null);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("branch", branch)
      .order("category")
      .order("name");
    
    if (error) toast.error(error.message);
    else setItems(data as MenuItem[]);
  };

  useEffect(() => { load(); }, [branch]);

  const save = async () => {
    if (!editing?.name || !editing.category || editing.price == null) {
      toast.error("Nama, kategori, dan harga wajib diisi");
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name,
      category: editing.category,
      price: Number(editing.price),
      description: editing.description ?? "",
      image_url: editing.image_url ?? null,
      available: editing.available ?? true,
      branch: branch,
      options: editing.options ?? null,
    };
    const { error } = editing.id
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editing.id ? "Menu diperbarui" : "Menu ditambahkan");
      setEditing(null);
      load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus menu ini?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Menu dihapus"); load(); }
  };

  const toggleAvail = async (it: MenuItem) => {
    const { error } = await supabase.from("menu_items").update({ available: !it.available }).eq("id", it.id);
    if (error) toast.error(error.message);
    else load();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from("menu-images").upload(fileName, file);
    if (error) toast.error(error.message);
    else {
      const { data: { publicUrl } } = supabase.storage.from("menu-images").getPublicUrl(fileName);
      setEditing(prev => prev ? { ...prev, image_url: publicUrl } : prev);
      toast.success("Gambar berhasil diunggah");
    }
    setUploading(false);
  };

  const togglePreset = (presetName: string) => {
    if (!editing) return;
    const currentOpts = editing.options || [];
    if (currentOpts.find(o => o.name === presetName)) {
      setEditing({ ...editing, options: currentOpts.filter(o => o.name !== presetName) });
    } else {
      const preset = PRESET_OPTIONS.find(p => p.name === presetName);
      if (preset) {
        setEditing({ ...editing, options: [...currentOpts, JSON.parse(JSON.stringify(preset))] });
      }
    }
  };

  const updatePresetPrice = (presetName: string, choiceIndex: number, newPrice: number) => {
    if (!editing) return;
    const currentOpts = [...(editing.options || [])];
    const grpIndex = currentOpts.findIndex(o => o.name === presetName);
    if (grpIndex !== -1) {
      currentOpts[grpIndex].choices[choiceIndex].price_diff = newPrice;
      setEditing({ ...editing, options: currentOpts });
    }
  };

  const togglePresetChoice = (presetName: string, choiceTemplate: any) => {
    if (!editing) return;
    const currentOpts = [...(editing.options || [])];
    const grpIndex = currentOpts.findIndex(o => o.name === presetName);
    if (grpIndex === -1) return;
    
    const grp = currentOpts[grpIndex];
    const choiceIndex = grp.choices.findIndex(c => c.name === choiceTemplate.name);
    
    if (choiceIndex !== -1) {
       grp.choices.splice(choiceIndex, 1);
    } else {
       grp.choices.push(JSON.parse(JSON.stringify(choiceTemplate)));
    }
    setEditing({ ...editing, options: currentOpts });
  };

  return (
    <div>
      <div className="mb-4 text-right">
        <button onClick={() => setEditing({ available: true, category: "coffee", price: 0, description: "", name: "", options: [], image_url: null })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Tambah Menu
        </button>
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
                  {list.map((it, idx) => (
                    <div key={it.id} className={`flex flex-wrap items-start gap-4 p-4 ${idx > 0 ? "border-t border-border" : ""}`}>
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
                          {!it.available && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">Habis</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</div>
                        {it.options && it.options.length > 0 && (
                          <div className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {it.options.length} Grup Opsi
                          </div>
                        )}
                      </div>
                      <div className="font-display font-bold text-accent">{formatRupiah(it.price)}</div>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
                        <input type="checkbox" checked={it.available} onChange={() => toggleAvail(it)} className="accent-[color:var(--accent)]" />
                        Tersedia
                      </label>
                      <button onClick={() => setEditing(it)} className="grid size-8 place-items-center rounded-lg bg-secondary hover:bg-accent/30">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => remove(it.id)} className="grid size-8 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-background shadow-warm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-xl font-bold">{editing.id ? "Edit Menu" : `Tambah Menu (${branch === 'kemang' ? 'Kemang' : 'Senopati'})`}</h2>
              <button onClick={() => setEditing(null)} className="grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/80"><X className="size-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* GAMBAR */}
              <div className="flex items-start gap-5">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <Upload className="size-6 opacity-50" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-sm font-semibold">Gambar Menu</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-secondary/80">
                    <Upload className="size-4" /> Upload Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">Format JPG, PNG. Ukuran ideal 1:1.</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* INFO DASAR */}
              <div className="space-y-4">
                <Field label="Nama Menu">
                  <input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kategori">
                    <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as MenuItem["category"] })} className="input">
                      {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Harga Dasar (Rp)">
                    <input type="number" min={0} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="input" />
                  </Field>
                </div>
                <Field label="Deskripsi">
                  <textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input resize-none" />
                </Field>
              </div>

              <div className="h-px bg-border" />

              {/* OPSI KUSTOMISASI SIMPLE */}
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">Opsi Kustomisasi</h3>
                  <p className="text-xs text-muted-foreground">Centang fitur yang ingin ditambahkan pada menu ini. Anda bisa mengubah harga tambahannya jika perlu.</p>
                </div>

                <div className="space-y-3">
                  {PRESET_OPTIONS.map((preset) => {
                    const activeGroup = (editing.options || []).find(o => o.name === preset.name);
                    const isActive = !!activeGroup;

                    return (
                      <div key={preset.name} className={`rounded-xl border transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <label className="flex cursor-pointer items-center gap-3 p-4">
                          <input 
                            type="checkbox" 
                            className="size-4 accent-primary" 
                            checked={isActive} 
                            onChange={() => togglePreset(preset.name)} 
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.type === "wajib" ? "Wajib Pilih 1" : "Opsional (Bisa banyak / Maks 1)"}</div>
                          </div>
                        </label>
                        
                        {isActive && activeGroup && (
                          <div className="border-t border-primary/20 bg-background/50 p-4 space-y-3">
                            {preset.choices.map((choice) => {
                              const activeChoiceIndex = activeGroup.choices.findIndex(c => c.name === choice.name);
                              const isChoiceActive = activeChoiceIndex !== -1;
                              const activeChoice = isChoiceActive ? activeGroup.choices[activeChoiceIndex] : choice;

                              return (
                                <div key={choice.name} className={`flex items-center justify-between gap-4 transition-all ${!isChoiceActive ? 'opacity-40 grayscale' : ''}`}>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      className="size-4 accent-primary" 
                                      checked={isChoiceActive}
                                      onChange={() => togglePresetChoice(preset.name, choice)}
                                    />
                                    <span className="text-sm font-medium">{choice.name}</span>
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">+Rp</span>
                                    <input 
                                      type="number"
                                      value={activeChoice.price_diff}
                                      onChange={(e) => isChoiceActive && updatePresetPrice(preset.name, activeChoiceIndex, Number(e.target.value))}
                                      disabled={!isChoiceActive}
                                      className="w-24 rounded-lg border border-border p-2 text-sm outline-none focus:border-primary bg-background disabled:bg-secondary/50"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-5">
              <label className="mb-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.available ?? true} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} />
                Tersedia untuk dipesan
              </label>
              <button onClick={save} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Simpan Menu
              </button>
            </div>
          </div>
          <style>{`.input{width:100%;border:1px solid var(--border);border-radius:.75rem;padding:.65rem .9rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--accent)}`}</style>
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
