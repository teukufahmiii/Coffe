import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { MapPin, CheckCircle2, Coffee, Bike, CreditCard, ChefHat, Loader2, ChevronLeft, Copy } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { tripayService } from "@/lib/tripay";
import { CompletedOrderView } from "@/components/orders/CompletedOrderView";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/order/$orderId")({
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(*, menu_items(image_url)), branches(name), reviews(*)`)
        .eq("id", orderId)
        .single();
      
      if (!error && data) {
        setOrder(data as unknown as Order);
        if (data.status !== 'completed' && data.status !== 'cancelled') {
          localStorage.setItem("lnr_active_order", data.id);
        } else {
          localStorage.removeItem("lnr_active_order");
        }
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to real-time status updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground font-semibold">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl font-bold">Pesanan tidak ditemukan</h1>
        <p className="mt-3 text-muted-foreground">Mungkin pesanan ini sudah dihapus atau ID tidak valid.</p>
        <Link to="/" className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Kembali ke Beranda</Link>
      </div>
    );
  }

  const isDelivery = order.order_type === 'delivery';
  const isPickup = order.order_type === 'pickup';

  // Status mapping for progress stepper
  let steps = [
    { id: "pending", label: "Menunggu Pembayaran", icon: CreditCard, activeStates: ["pending"] },
    { id: "paid", label: "Di Proses", icon: ChefHat, activeStates: ["paid"] },
    { id: "served", label: isDelivery ? "Dikirim Driver" : "Siap Diambil", icon: isDelivery ? Bike : MapPin, activeStates: ["served"] },
    { id: "completed", label: "Pesanan Selesai", icon: CheckCircle2, activeStates: ["completed"] }
  ];

  const currentStepIndex = steps.findIndex(s => s.activeStates.includes(order.status));

  if (order.status === 'completed') {
    return <CompletedOrderView order={order} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-8 pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition">
            <ChevronLeft className="size-4" /> Kembali
          </Link>

          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft">
            <div className="flex flex-col items-center justify-center mb-8 relative">
              <h1 className="font-display text-3xl font-bold">Status Pesanan</h1>
              <p className="text-muted-foreground text-sm mt-1">ID Pesanan: {order.id.slice(0, 8).toUpperCase()}</p>

              {order.status === 'pending' && (
                <button 
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);
                    if (error) {
                      alert("Gagal simulasi: " + error.message);
                    } else {
                      alert("Simulasi berhasil! Pesanan langsung diproses.");
                      window.location.reload();
                    }
                  }}
                  title="Simulasi Pembayaran Berhasil"
                  className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200 transition shadow-sm z-20 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  <span className="hidden sm:inline">Simulasi Lunas</span>
                </button>
              )}
            </div>

            {/* Stepper */}
            <div className="relative mb-12">
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-secondary -z-10 rounded-full md:left-1/2 md:top-8 md:w-3/4 md:h-1 md:-ml-[37.5%] md:bottom-auto"></div>
              
              <div className="flex flex-col gap-8 md:flex-row md:justify-between relative z-10">
                {steps.map((step, index) => {
                  const isCompleted = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className={`flex items-start md:flex-col md:items-center gap-4 md:gap-3 ${isCompleted ? 'text-accent' : 'text-muted-foreground opacity-50'}`}>
                      <div className={`grid size-16 shrink-0 place-items-center rounded-full border-4 transition-colors ${
                        isCurrent ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20' 
                        : isCompleted ? 'bg-accent/10 border-accent' 
                        : 'bg-secondary border-background'
                      }`}>
                        <Icon className="size-7" />
                      </div>
                      <div className="pt-3 md:pt-0 md:text-center min-w-0">
                        <div className="font-bold text-sm md:text-xs uppercase tracking-wider">{step.label}</div>
                        {isCurrent && (
                          <div className="text-xs mt-1 text-foreground font-medium">Sedang berlangsung...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Section (Closed Payment UI) */}
            {order.status === 'pending' && (
              <div className="mb-8 rounded-xl bg-accent/5 border border-accent/20 p-5 md:p-8">
                <div className="text-center mb-6">
                  <h2 className="font-display text-xl font-bold text-accent-foreground mb-2">Selesaikan Pembayaran</h2>
                  <p className="text-sm text-muted-foreground">
                    Lakukan pembayaran sebesar <span className="font-bold text-foreground">{formatRupiah(order.total)}</span>
                  </p>
                </div>
                
                {/* QRIS Display */}
                {order.payment_qr_url && (
                  <div className="flex flex-col items-center mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-4 inline-block">
                      <img src={order.payment_qr_url} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground text-center max-w-sm">
                      Scan QRIS ini menggunakan aplikasi M-Banking atau e-Wallet pilihan Anda (ShopeePay, GoPay, OVO, Dana, LinkAja, dll).
                    </p>
                  </div>
                )}

                {/* Virtual Account / Payment Code */}
                {order.payment_code && (
                  <div className="flex flex-col items-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Nomor Virtual Account / Kode Bayar</p>
                    <div className="bg-background border border-border rounded-lg px-6 py-3 flex items-center justify-center mb-2">
                      <span className="font-mono text-2xl font-bold tracking-wider">{order.payment_code}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Gunakan kode di atas untuk melakukan pembayaran.</p>
                  </div>
                )}

                {/* Instructions */}
                {order.payment_instructions && Array.isArray(order.payment_instructions) && (
                  <div className="mt-8 text-left max-w-xl mx-auto border-t border-border/50 pt-6">
                    <h3 className="font-semibold mb-4">Cara Pembayaran</h3>
                    <div className="space-y-4">
                      {order.payment_instructions.map((inst: any, idx: number) => (
                        <details key={idx} className="group rounded-lg border border-border bg-background">
                          <summary className="cursor-pointer font-medium p-4 hover:bg-accent/5 transition-colors">
                            {inst.title}
                          </summary>
                          <div className="p-4 pt-0 text-sm text-muted-foreground">
                            <ol className="list-decimal list-outside ml-4 space-y-2">
                              {inst.steps?.map((step: string, sIdx: number) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback to Redirect if something went wrong or using open payment */}
                {!order.payment_qr_url && !order.payment_code && order.payment_url && (
                  <div className="text-center mt-6">
                    <a 
                      href={order.payment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-warm hover:opacity-90"
                    >
                      Lanjut Bayar di Tripay
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="h-px bg-border my-8" />

            {/* Order Details */}
            <div>
              <h3 className="font-display font-bold text-lg mb-4">Rincian Pesanan</h3>
              <ul className="space-y-3">
                {order.order_items?.map((item) => {
                  const match = (item.name || "").match(/^(.*?)\s*\((.*)\)$/);
                  const baseName = match ? match[1] : item.name;
                  const notePart = match ? match[2] : "";
                  const img = (item as any).menu_items?.image_url;

                  return (
                    <li key={item.id} className="flex gap-3 text-sm">
                      <img 
                        src={img || `/images/${baseName.toLowerCase().replace(/\s+/g, '-')}.png`} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `/images/${(item as any).menu_items?.category || 'coffee'}.png`;
                        }}
                        alt={baseName} 
                        className="size-14 rounded-lg object-cover bg-secondary" 
                      />
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-center">
                          <span className="font-medium"><span className="text-accent">{item.qty}×</span> {baseName}</span>
                          <span className="text-muted-foreground font-semibold">{formatRupiah(item.price * item.qty)}</span>
                        </div>
                      {notePart && (
                        <div className="mt-1 pl-6 text-xs text-muted-foreground border-l-2 border-border/50 ml-1.5">
                          <ul className="space-y-1">
                            {notePart.split(" | ").map((opt, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-accent/60">•</span> {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Belanja</span>
                <span className="text-accent">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
