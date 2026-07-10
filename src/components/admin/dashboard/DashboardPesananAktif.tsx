import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Clock, MapPin, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Definitions from admin.index
type OrderItem = { id: string; name: string; price: number; qty: number; note: string | null };
type Order = {
  id: string;
  table_number: number;
  status: "pending" | "cooking" | "served" | "paid" | "cancelled" | "completed";
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

const STATUS_STYLES: Record<Order["status"], { border: string; label: string; chip: string }> = {
  pending:   { border: "border-l-destructive",           label: "Blm Dibayar", chip: "bg-destructive/10 text-destructive" },
  paid:      { border: "border-l-[oklch(0.7_0.17_55)]", label: "Di proses",  chip: "bg-[oklch(0.7_0.17_55/0.2)] text-[oklch(0.55_0.17_55)]" },
  cooking:   { border: "border-l-accent",                label: "Pesanan Dibuat", chip: "bg-accent/20 text-accent" },
  served:    { border: "border-l-[oklch(0.6_0.13_150)]", label: "Siap / Dikirim", chip: "bg-[oklch(0.6_0.13_150/0.2)] text-[oklch(0.45_0.13_150)]" },
  completed: { border: "border-l-muted",                 label: "Selesai",     chip: "bg-muted text-muted-foreground" },
  cancelled: { border: "border-l-destructive",           label: "Batal",     chip: "bg-destructive/10 text-destructive" },
};

export function DashboardPesananAktif({ branch, type }: { branch: string, type: 98 | 99 }) {
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
    else setOrders(data as unknown as Order[]);
  };

  useEffect(() => {
    setOrders(null);
    load();
    const ch = supabase
      .channel(`orders-${branch}-${type}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        const newOrder = payload.new as any;
        
        if (payload.eventType === "INSERT" && initialised.current && newOrder.branch === branch && newOrder.table_number === type) {
          if (newOrder.status === "cooking") {
            try { new Audio("data:audio/wav;base64,UklGRl9vAACAAAAAAQABAESsAACAfQAAAgAQAGRhdGE=").play().catch(()=>{}); } catch {}
            toast.info(`Pesanan ${type === 98 ? 'Pick Up' : 'Delivery'} baru masuk!`);
          }
        } 
        else if (payload.eventType === "UPDATE" && initialised.current && newOrder.branch === branch && newOrder.table_number === type) {
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
    
    setOrders(prev => {
      if (!prev) return prev;
      if (status === "pending") {
         return prev.filter(o => o.id !== id);
      }
      return prev.map(o => o.id === id ? { ...o, status } : o);
    });

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      load();
    } else {
      toast.success(`Status diperbarui`);
    }
    setUpdating(null);
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data pesanan ini secara permanen?")) return;
    setUpdating(id);
    
    setOrders(prev => prev ? prev.filter(o => o.id !== id) : prev);

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      load();
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
            const orderNumber = o.queue_number || o.id.split("-")[0];
            
            let displayNote = o.note;
            let displayCustomerName = o.customer_name;
            let displayCustomerPhone = o.customer_phone;
            
            if (displayNote?.includes("| Name: ")) {
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
                        {isDelivery && <option value="served">Dikirim driver</option>}
                        {o.table_number === 98 && <option value="served">Siap Diambil</option>}
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
