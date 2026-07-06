import { Order } from "@/types/order";
import { formatRupiah } from "@/lib/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, MapPin, Store, Star, Copy, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ReviewModal } from "./ReviewModal";

interface CompletedOrderViewProps {
  order: Order;
}

export function CompletedOrderView({ order }: CompletedOrderViewProps) {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [initialRating, setInitialRating] = useState(0);

  const existingReview = order.reviews && order.reviews.length > 0 ? order.reviews[0] : null;
  
  const isDelivery = order.order_type === "delivery";
  const dateStr = order.created_at ? format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: id }) : "";
  const firstItem = order.order_items?.[0];
  const itemImage = (firstItem as any)?.image_url;
  const itemCount = order.order_items?.reduce((sum, i) => sum + i.qty, 0) || 0;

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col pb-24">
      {/* Header */}
      <header className="bg-white px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Link to="/orders" className="p-2 -ml-2 text-black hover:bg-secondary rounded-full transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Detail Pesanan</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1">
        {/* Rating Section */}
        <div className="bg-white mt-2 p-6 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #5C4033 0%, transparent 70%)", top: "-50%" }}></div>
           
           {existingReview ? (
             <>
               <h2 className="font-bold text-[#5C4033] mb-4 text-center z-10">Terima kasih atas ulasanmu!</h2>
               <div className="flex items-center gap-2 z-10">
                 {[1,2,3,4,5].map((star) => (
                   <Star 
                     key={star} 
                     className={`size-8 transition-colors ${
                       existingReview.rating >= star 
                         ? "fill-yellow-400 text-yellow-400" 
                         : "fill-border text-border"
                     }`} 
                   />
                 ))}
               </div>
             </>
           ) : (
             <>
               <h2 className="font-bold text-[#5C4033] mb-4 text-center z-10">Gimana Pengalaman Belanjamu?</h2>
               <div className="flex items-center gap-2 z-10">
                 {[1,2,3,4,5].map((star) => (
                   <button 
                     key={star} 
                     onClick={() => {
                       setInitialRating(star);
                       setShowReviewModal(true);
                     }}
                     className="focus:outline-none transition-transform active:scale-90 hover:-translate-y-1"
                   >
                     <Star className="size-8 text-border fill-border hover:fill-[#5C4033] hover:text-[#5C4033] transition-colors cursor-pointer" />
                   </button>
                 ))}
               </div>
             </>
           )}
        </div>

        {/* Lokasi Pengambilan */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-sm mb-3">Lokasi Pengambilan</h3>
          <div className="flex items-center gap-3">
             <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10">
                {isDelivery ? <MapPin className="size-5 text-[#5C4033]" /> : <Store className="size-5 text-[#5C4033]" />}
             </div>
             <div className="font-bold text-sm">
               {isDelivery ? order.customer_address?.split(',')[0] || "Alamat Pengiriman" : (order as any).branches?.name || "Kemang Raya"}
             </div>
          </div>
        </div>

        {/* Detail Pesanan */}
        <div className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-sm">Detail Pesanan</h3>
             <span className="text-[11px] text-muted-foreground">Total Item: {itemCount}</span>
          </div>
          
          <div className="space-y-4">
            {order.order_items?.map((item, idx) => {
               // Extract notes if appended to name like "Name (note)"
               const match = (item.name || "").match(/^(.*?)\s*\((.*)\)$/);
               const baseName = match ? match[1] : item.name;
               const notePart = match ? match[2] : "";
               const img = (item as any).menu_items?.image_url;

               return (
                 <div key={idx} className="flex items-start gap-3">
                    <img 
                      src={img || `/images/${baseName.toLowerCase().replace(/\s+/g, '-')}.png`} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `/images/${(item as any).menu_items?.category || 'coffee'}.png`;
                      }}
                      alt={baseName} 
                      className="size-14 rounded-lg object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                          <div className="font-bold text-[13px]">{baseName}</div>
                          <div className="font-bold text-[13px]">{formatRupiah(item.price * item.qty)}</div>
                       </div>
                       <div className="flex justify-between items-start mt-1">
                          <div className="text-[11px] text-muted-foreground line-clamp-2 pr-2">{notePart || "Normal"}</div>
                          <div className="text-[11px] text-muted-foreground">{item.qty}x</div>
                       </div>
                    </div>
                 </div>
               );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-border/60 text-center">
             <button className="text-[#5C4033] font-bold text-xs flex items-center justify-center gap-1 w-full">Selengkapnya <ChevronLeft className="size-3 -rotate-90" /></button>
          </div>
        </div>

        {/* Rincian Pembayaran */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-sm mb-4">Rincian Pembayaran</h3>
          <div className="flex items-center justify-between font-bold text-sm">
             <div>Total Pembayaran</div>
             <div>{formatRupiah(order.total)}</div>
          </div>
          <div className="flex items-center justify-between mt-2">
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">D</div>
                <span className="capitalize">{order.payment_channel || "Tunai"}</span>
             </div>
             <div className="text-xs font-bold text-[#5C4033] bg-[#5C4033]/10 px-2 py-0.5 rounded">
                +2 Poin <span className="text-muted-foreground/50 font-normal ml-0.5">ⓘ</span>
             </div>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-border/60 text-center">
             <button className="text-[#5C4033] font-bold text-xs flex items-center justify-center gap-1 w-full">Selengkapnya <ChevronLeft className="size-3 -rotate-90" /></button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white mt-2 p-4 space-y-3 pb-8">
           <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">ID Pesanan</span>
              <div className="flex items-center gap-1 font-medium">
                 #{order.id.slice(0, 12).toUpperCase()} <Copy className="size-3 text-muted-foreground cursor-pointer" />
              </div>
           </div>
           <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Waktu Pembayaran</span>
              <span className="font-medium">{dateStr}</span>
           </div>
           <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Metode Pemesanan</span>
              <span className="font-medium">{isDelivery ? "Delivery via Aplikasi" : "Pick Up via Aplikasi"}</span>
           </div>
           
           <button 
             onClick={() => navigate({ to: "/receipt/$orderId", params: { orderId: order.id } })}
             className="w-full mt-4 py-3 rounded-full border border-[#5C4033] text-[#5C4033] font-bold text-sm hover:bg-[#5C4033]/10 transition-colors"
           >
             Lihat E-Receipt
           </button>
        </div>
      </main>

      {/* Butuh Bantuan Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10">
         <button className="w-full py-3.5 bg-[#5C4033] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
           Butuh Bantuan?
         </button>
      </div>
      {/* Review Modal */}
      <ReviewModal 
        order={order}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        initialRating={initialRating}
      />
    </div>
  );
}
