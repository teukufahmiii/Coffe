import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useMenuItems } from "@/hooks/useMenuItems";
import { MenuCard } from "@/components/shared/MenuCard";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";
import { DeliveryCheckout } from "@/components/delivery/DeliveryCheckout";
import { tripayService } from "@/services/tripayService";

export const Route = createFileRoute("/delivery")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      branch: search.branch as string | undefined,
    };
  },
  component: DeliveryOrderPage,
});

const CATS = [
  { id: "semua", label: "Semua" },
  { id: "coffee", label: "Coffee" },
  { id: "non-coffee", label: "Non-Coffee" },
  { id: "snack", label: "Snack" },
  { id: "makanan", label: "Makanan" },
] as const;

function DeliveryOrderPage() {
  const navigate = useNavigate({ from: "/delivery" });
  const { branch } = useSearch({ from: "/delivery" });
  const branchSlug = branch || "kemang";
  
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("semua");
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { cart, adjustQty, clearCart, totals } = useCart();
  const { data: items, isLoading } = useMenuItems(branchSlug);

  const filtered = items?.filter((m) => cat === "semua" || m.category === cat) ?? [];

  const handleCheckoutSubmit = async (details: any) => {
    setSubmitting(true);
    try {
      const { data: branchData } = await supabase.from('branches').select('id').eq('slug', branchSlug).single();
      const branchId = branchData?.id;

      const orderPayload: any = {
        table_number: 99, 
        total: totals.total, 
        note: details.globalNote, 
        status: "pending", 
        order_type: "delivery",
        branch_id: branchId,
        customer_name: details.customerName,
        customer_phone: details.customerPhone,
        customer_address: details.customerAddress,
        customer_lat: details.customerLat ?? null,
        customer_lng: details.customerLng ?? null,
        driver_type: details.driverType,
        payment_channel: details.paymentChannel,
        agreed_terms: details.agreedTerms
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();
        
      if (error) throw error;
      
      const rows = Object.values(cart).map((v) => ({
        order_id: order.id,
        menu_item_id: v.menuItemId || v.id,
        name: v.note ? `${v.name} (${v.note})` : v.name,
        price: v.price,
        qty: v.qty,
      }));
      
      const { error: e2 } = await supabase.from("order_items").insert(rows);
      if (e2) throw e2;
      
      // Tripay integration
      toast.loading("Mempersiapkan pembayaran...", { id: "payment-loading" });
      try {
        await tripayService.createTransaction(order.id);
        
        toast.success("Pesanan Delivery terkirim!");
        clearCart();
        setShowCheckout(false);
        localStorage.setItem("lnr_active_order", order.id);
        
        // Instead of redirecting to Tripay checkout page, 
        // we go to our own order page which will show the QR / Instructions
        navigate({ to: "/order/$orderId", params: { orderId: order.id } });
        return;
      } catch (err) {
        console.error("Tripay transaction error:", err);
        localStorage.setItem("lnr_active_order", order.id);
        // Fallback to order page even if tripay fails
        navigate({ to: "/order/$orderId", params: { orderId: order.id } });
      } finally {
        toast.dismiss("payment-loading");
      }
    } catch (e: any) {
      toast.error("Gagal mengirim pesanan", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="grid size-10 place-items-center rounded-full bg-secondary text-foreground"><ArrowLeft className="size-4" /></Link>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">LNR Coffee {branchSlug}</div>
            <div className="font-display text-lg font-bold">Delivery</div>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-accent/10 text-accent"><MapPin className="size-4" /></div>
        </div>
        <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 pb-3">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${cat === c.id ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-accent/20"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {isLoading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />)}</div>}
        <div className="space-y-3">
          {filtered.map((m) => (
            <MenuCard 
              key={m.id}
              id={m.id}
              name={m.name}
              price={m.price}
              description={m.description}
              image_url={m.image_url}
              category={m.category}
              qty={cart[m.id]?.qty || 0}
              onAdd={() => adjustQty({ id: m.id, name: m.name, price: m.price, image_url: m.image_url, category: m.category }, 1)}
              onRemove={() => adjustQty({ id: m.id, name: m.name, price: m.price, image_url: m.image_url, category: m.category }, -1)}
              onClick={() => setSelectedItem(m)}
            />
          ))}
        </div>
      </main>

      <ItemDetailModal 
        selectedItem={selectedItem} 
        setSelectedItem={setSelectedItem} 
        onAdd={(item) => {
          adjustQty({ id: item.id, name: item.name, price: item.price, note: item.note, menuItemId: item.menuItemId, image_url: item.image_url, category: item.category }, 1);
          setSelectedItem(null);
          toast.success(`${item.name} ditambahkan!`);
        }} 
      />

      {showCheckout && (
        <DeliveryCheckout 
          branchSlug={branchSlug}
          cart={cart}
          totals={totals}
          adjustCartQty={(id, delta) => adjustQty({ id, name: cart[id].name, price: cart[id].price }, delta)}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckoutSubmit}
          submitting={submitting}
        />
      )}

      {totals.count > 0 && !showCheckout && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{totals.count} item</div>
              <div className="font-display text-lg font-bold">{formatRupiah(totals.total)}</div>
            </div>
            <button onClick={() => setShowCheckout(true)} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-md hover:opacity-90">
              <ShoppingBag className="size-4" /> Lanjut Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
