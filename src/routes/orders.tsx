import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Store, Smartphone, Loader2, Home, Ticket, FileText, User } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatRupiah } from "@/lib/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="p-2 -ml-2 text-black hover:bg-secondary rounded-full transition-colors">
            <ChevronLeft className="size-6" />
          </Link>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Riwayat Pesanan</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 px-4 py-2 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="size-8 animate-spin text-[#5C4033]" />
            <p className="font-medium">Memuat pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 text-center">
            <FileText className="size-12 text-black/20" />
            <p className="font-medium text-sm">Belum ada riwayat pesanan.</p>
          </div>
        ) : (
          orders.map((order) => {
            const dateStr = order.created_at ? format(new Date(order.created_at), "d MMM yyyy HH:mm", { locale: id }) : "";
            const isCompleted = order.status === "completed" || order.status === "served";
            const isDelivery = order.order_type === "delivery";
            const firstItem = order.order_items?.[0];
            const itemCount = order.order_items?.reduce((sum, i) => sum + i.qty, 0) || 0;
            
            // Use image from menu_items if available, with a fallback
            const itemImage = (firstItem as any)?.menu_items?.image_url;
            const fallbackImage = firstItem ? `/images/${(firstItem.name || "").toLowerCase().replace(/\s+/g, '-')}.png` : "";
            const categoryFallback = `/images/${(firstItem as any)?.menu_items?.category || 'coffee'}.png`;

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 flex flex-col cursor-pointer"
                onClick={() => navigate({ to: "/order/$orderId", params: { orderId: order.id } })}
              >
                {/* Header Card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10">
                       {isDelivery ? <MapPin className="size-5 text-[#5C4033]" /> : <Store className="size-5 text-[#5C4033]" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">
                        {isDelivery ? "Delivery" : "Pick Up"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{dateStr}</div>
                    </div>
                  </div>
                  {isCompleted ? (
                    <div className="bg-[#5C4033]/10 text-[#5C4033] px-3 py-1 rounded-full text-[11px] font-bold">
                      Selesai
                    </div>
                  ) : (
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold">
                      Diproses
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-border/50 my-2" />

                {/* Main Item Info */}
                {firstItem && (
                  <div className="flex items-center gap-3 py-2">
                    <img 
                      src={itemImage || fallbackImage} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = categoryFallback;
                      }}
                      alt={firstItem.name} 
                      className="size-12 rounded-lg object-cover bg-secondary" 
                    />
                    <div className="font-bold text-[13px] line-clamp-2">{firstItem.name} {order.order_items && order.order_items.length > 1 ? ` + ${order.order_items.length - 1} item lainnya` : ""}</div>
                  </div>
                )}

                <div className="h-px w-full bg-border/50 my-2" />

                {/* Location & Source */}
                <div className="flex items-start justify-between py-1 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] truncate">
                      {isDelivery ? order.customer_address?.split(',')[0] || "Alamat Pengiriman" : (order as any).branches?.name || "Kemang Raya"}
                    </div>
                    {isDelivery && order.customer_address && (
                      <div className="flex items-start gap-2 mt-1">
                         <div className="w-0.5 h-6 bg-border ml-1.5 shrink-0" />
                         <div className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                           {order.customer_address}
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
                    via Aplikasi <Smartphone className="size-3" />
                  </div>
                </div>

                <div className="h-px w-full bg-border/50 my-3" />

                {/* Footer Card */}
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-muted-foreground">
                    {itemCount} item • <span className="font-medium text-foreground">{formatRupiah(order.total)}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
                    }}
                    className="rounded-full border border-[#5C4033] text-[#5C4033] font-bold text-[12px] px-5 py-1.5 hover:bg-[#5C4033]/10 transition-colors"
                  >
                    Beli Lagi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Bottom Nav to match Fore */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
        <div className="flex items-center justify-around px-2 py-3">
          <Link to="/" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-[#5C4033]">
            <Home className="size-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-muted-foreground opacity-50">
            <Ticket className="size-5" />
            <span className="text-[10px] font-medium">Voucher</span>
          </div>
          <Link to="/orders" className="flex flex-col items-center gap-1 text-[#5C4033]">
            <FileText className="size-5 fill-[#5C4033]" />
            <span className="text-[10px] font-bold">Pesanan</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-muted-foreground opacity-50">
            <User className="size-5" />
            <span className="text-[10px] font-medium">Akun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
