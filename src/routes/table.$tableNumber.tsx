import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Coffee, Minus, Plus, ShoppingBag, Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";

export const Route = createFileRoute("/table/$tableNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Meja ${params.tableNumber} — LNR Coffee` },
      { name: "description", content: `Pesan langsung dari Meja ${params.tableNumber} di LNR Coffee.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TableOrderPage,
});

const CATS = [
  { id: "semua", label: "Semua" },
  { id: "coffee", label: "Coffee" },
  { id: "hot-coffee", label: "Hot Coffee" },
  { id: "americano", label: "Americano" },
  { id: "non-coffee", label: "Non-Coffee" },
  { id: "snack", label: "Snack" },
  { id: "makanan", label: "Makanan" },
  { id: "tumbler", label: "Tumbler" },
] as const;

type Cart = Record<string, { name: string; price: number; qty: number; note?: string; menuItemId?: string; image_url?: string | null; category?: string }>;

function TableOrderPage() {
  const { tableNumber } = useParams({ from: "/table/$tableNumber" });
  const navigate = useNavigate({ from: "/table/$tableNumber" });
  const n = Number(tableNumber);
  const validTable = Number.isInteger(n) && n >= 1 && n <= 30;

  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("coffee");
  const [cart, setCart] = useState<Cart>({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["menu", "available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: validTable,
  });

  const filtered = useMemo(() => items?.filter((m) => m.category === cat) ?? [], [items, cat]);
  const totals = useMemo(() => {
    const entries = Object.entries(cart);
    const count = entries.reduce((a, [, v]) => a + v.qty, 0);
    const total = entries.reduce((a, [, v]) => a + v.qty * v.price, 0);
    return { count, total };
  }, [cart]);

  if (!validTable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-4xl font-bold">Meja tidak ditemukan</h1>
          <p className="mt-3 text-muted-foreground">Nomor meja harus 1–30. Silakan pindai ulang QR di mejamu.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ke beranda</Link>
        </div>
      </div>
    );
  }

  const adjust = (id: string, item: { name: string; price: number; note?: string; menuItemId?: string; image_url?: string | null; category?: string }, delta: number) => {
    setCart((c) => {
      const cur = c[id]?.qty ?? 0;
      const next = cur + delta;
      const copy = { ...c };
      if (next <= 0) delete copy[id];
      else copy[id] = { ...item, qty: next };
      return copy;
    });
  };

  const submit = async () => {
    if (totals.count === 0) return;
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({ table_number: n, total: totals.total, note: note || null, status: "pending" })
        .select()
        .single();
      if (error) throw error;
      const rows = Object.values(cart).map((v: any) => ({
        order_id: order.id,
        menu_item_id: v.menuItemId || v.id,
        name: v.note ? `${v.name} (${v.note})` : v.name,
        price: v.price,
        qty: v.qty,
      }));
      const { error: e2 } = await supabase.from("order_items").insert(rows);
      if (e2) throw e2;
      toast.success("Pesanan terkirim!", { description: `Meja ${n} · ${formatRupiah(totals.total)}` });
      setCart({});
      setNote("");
      setShowCart(false);
      localStorage.setItem("lnr_active_order", order.id);
      localStorage.setItem("lnr_has_ordered", "true");
      
      // Navigate to order page
      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    } catch (e: any) {
      toast.error("Gagal mengirim pesanan", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="grid size-10 place-items-center rounded-full bg-secondary text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">LNR Coffee</div>
            <div className="font-display text-lg font-bold">Meja No. {n}</div>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-accent/20 text-accent">
            <Coffee className="size-4" />
          </div>
        </div>

        {/* CAT TABS */}
        <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 pb-3">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
                cat === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent/20"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {/* MENU LIST */}
      <main className="mx-auto max-w-2xl px-4 py-5">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Belum ada menu di kategori ini.
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((m) => {
            const q = cart[m.id]?.qty ?? 0;
            return (
              <article 
                key={m.id} 
                onClick={() => setSelectedItem(m)}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft cursor-pointer transition hover:bg-secondary/20"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-accent/15">
                  <img 
                    src={m.image_url || `/images/${m.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `/images/${m.category}.png`;
                    }}
                    alt={m.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-display text-base font-semibold">{m.name}</h3>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-accent">{formatRupiah(m.price)}</span>
                    {q === 0 ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); adjust(m.id, { name: m.name, price: m.price, image_url: m.image_url, category: m.category }, 1); }}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        <Plus className="size-3.5" /> Tambah
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-3 rounded-full bg-secondary px-2 py-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => adjust(m.id, { name: m.name, price: m.price, image_url: m.image_url, category: m.category }, -1)} className="grid size-7 place-items-center rounded-full bg-background">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm font-bold">{q}</span>
                        <button onClick={() => adjust(m.id, { name: m.name, price: m.price, image_url: m.image_url, category: m.category }, 1)} className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* FULL PAGE DETAILS */}
      <ItemDetailModal 
        selectedItem={selectedItem} 
        setSelectedItem={setSelectedItem} 
        onAdd={(item) => {
          adjust(item.id, { name: item.name, price: item.price, note: item.note, menuItemId: item.menuItemId, image_url: item.image_url, category: item.category }, 1);
          setSelectedItem(null);
          toast.success(`${item.name} ditambahkan!`);
        }} 
      />

      {/* CART SHEET */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setShowCart(false)}>
          <div className="w-full rounded-t-3xl bg-background p-5 shadow-warm" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />
            <h2 className="font-display text-xl font-bold">Pesananmu · Meja {n}</h2>
            <div className="mt-4 max-h-[40vh] space-y-3 overflow-y-auto">
              {Object.entries(cart).map(([id, v]) => (
                <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{formatRupiah(v.price)} × {v.qty}</div>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => adjust(id, { name: v.name, price: v.price, note: v.note, menuItemId: v.menuItemId, image_url: v.image_url, category: v.category }, -1)} className="grid size-7 place-items-center rounded-full bg-secondary">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{v.qty}</span>
                    <button onClick={() => adjust(id, { name: v.name, price: v.price, note: v.note, menuItemId: v.menuItemId, image_url: v.image_url, category: v.category }, 1)} className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan untuk barista (opsional)"
              className="mt-4 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-accent"
              rows={2}
            />
            <button
              onClick={submit}
              disabled={submitting || totals.count === 0}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-warm disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Konfirmasi · {formatRupiah(totals.total)}
            </button>
          </div>
        </div>
      )}

      {/* STICKY CART BAR */}
      {totals.count > 0 && !showCart && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{totals.count} item</div>
              <div className="font-display text-lg font-bold">{formatRupiah(totals.total)}</div>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-warm hover:opacity-90"
            >
              <ShoppingBag className="size-4" /> Pesan Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
