import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { Loader2, ChevronLeft, Download } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const Route = createFileRoute("/receipt/$orderId")({
  component: EReceiptPage,
});

function EReceiptPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`*, order_items(*), branches(name)`)
          .eq("id", orderId)
          .single();

        if (error) throw error;
        setOrder(data as any);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3EC] flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#5C4033]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F6F3EC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-bold text-2xl text-[#5C4033]">Struk Tidak Ditemukan</h1>
        <Link to="/" className="mt-4 text-[#5C4033] underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const dateStr = order.created_at ? format(new Date(order.created_at), "d MMM yyyy, HH:mm", { locale: id }) : "";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24 print:bg-white print:pb-0">
      {/* Header - Hidden in Print */}
      <header className="bg-white px-4 pt-6 pb-4 flex items-center justify-between shadow-sm print:hidden">
        <Link to="/order/$orderId" params={{ orderId: order.id }} className="p-2 -ml-2 text-black hover:bg-secondary rounded-full transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">E-Receipt</h1>
        <div className="w-10"></div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center p-4 print:p-0">
        <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-sm flex flex-col font-mono text-sm border border-border/50 print:border-none print:shadow-none">
           <div className="p-6">
             {/* Logo / Header Struk */}
             <div className="text-center mb-6">
               <div className="font-display font-bold text-xl mb-1 text-[#5C4033] print:text-black">LNR COFFEE</div>
               <div className="text-xs text-muted-foreground print:text-black">
                 {(order as any).branches?.name || "LNR Coffee Kemang"}<br/>
                 Jl. Kemang Raya No.1, Jakarta Selatan
               </div>
             </div>
             
             <div className="border-t border-dashed border-border/60 my-4 print:border-black/50" />
             
             {/* Order Info */}
             <div className="space-y-1 mb-4 text-xs">
               <div className="flex justify-between">
                 <span>Waktu</span>
                 <span>{dateStr}</span>
               </div>
               <div className="flex justify-between">
                 <span>No. Pesanan</span>
                 <span>{order.id.slice(0,8).toUpperCase()}</span>
               </div>
               <div className="flex justify-between">
                 <span>Metode</span>
                 <span>{order.order_type === 'pickup' ? "Pick Up" : "Delivery"}</span>
               </div>
               <div className="flex justify-between">
                 <span>Pembayaran</span>
                 <span className="capitalize">{order.payment_channel || "Tunai"}</span>
               </div>
             </div>
             
             <div className="border-t border-dashed border-border/60 my-4 print:border-black/50" />
             
             {/* Items */}
             <div className="space-y-3 mb-4">
               {order.order_items?.map((item, idx) => (
                 <div key={idx} className="text-xs">
                   <div className="font-semibold">{item.name}</div>
                   <div className="flex justify-between mt-1">
                     <span>{item.qty} x {formatRupiah(item.price)}</span>
                     <span>{formatRupiah(item.price * item.qty)}</span>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="border-t border-dashed border-border/60 my-4 print:border-black/50" />
             
             {/* Totals */}
             <div className="space-y-1 mb-4 text-xs font-semibold">
               <div className="flex justify-between">
                 <span>Subtotal</span>
                 <span>{formatRupiah(order.total)}</span>
               </div>
               <div className="flex justify-between">
                 <span>PB1 (10%)</span>
                 <span>Termasuk</span>
               </div>
               <div className="flex justify-between text-base mt-2 pt-2 border-t border-dashed border-border/60 print:border-black/50">
                 <span>Total</span>
                 <span>{formatRupiah(order.total)}</span>
               </div>
             </div>
             
             <div className="border-t border-dashed border-border/60 my-4 print:border-black/50" />
             
             <div className="text-center text-xs text-muted-foreground italic print:text-black">
               Terima kasih atas kunjungan Anda.<br/>
               Semoga harimu menyenangkan!
             </div>
           </div>
        </div>

        {/* Action Button - Hidden in Print */}
        <div className="w-full max-w-sm mt-6 print:hidden">
          <button 
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#5C4033] text-white font-bold rounded-full hover:opacity-90 shadow-md"
          >
            <Download className="size-5" />
            Unduh PDF / Cetak
          </button>
        </div>
      </main>
    </div>
  );
}
