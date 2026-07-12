import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { MapPin, ShoppingBag, User, ClipboardList, Star, Coffee, ChevronRight, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { BerandaHero } from "@/components/home/BerandaHero";
import { BerandaLayanan } from "@/components/home/BerandaLayanan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LNR Coffee — Specialty Coffee, Hangat & Dekat" },
      { name: "description", content: "LNR Coffee menyajikan kopi spesial dengan pengalaman pesan QR per meja. Tanpa antri, langsung dari mejamu." },
      { property: "og:title", content: "LNR Coffee" },
      { property: "og:description", content: "Specialty coffee. Hangat. Premium. Tanpa antri — scan QR dari mejamu." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const [headerTextIndex, setHeaderTextIndex] = useState(0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (user?.phone) {
      supabase.from('profiles').select('points').eq('phone', user.phone).single().then(({ data }) => {
        if (data) setPoints(data.points || 0);
      });
    }
  }, [user]);

  useEffect(() => {
    const orderId = localStorage.getItem("lnr_active_order");
    if (!orderId) return;

    const fetchOrder = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (data) {
        if (data.status === "completed" || data.status === "cancelled") {
          localStorage.removeItem("lnr_active_order");
          setActiveOrder(null);
        } else {
          setActiveOrder(data as Order);
        }
      }
    };
    
    fetchOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, fetchOrder)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const headerTexts = [
    "Mau menikmati Menu LNR yang mana nih?",
    "Pesan dengan Pick Up, pesan tanpa antri",
    "Pesan dengan LNR Driver, jaminan tepat waktu"
  ];

  useEffect(() => {
    const textTimer = setInterval(() => {
      setHeaderTextIndex((prev) => (prev + 1) % headerTexts.length);
    }, 3000);
    return () => clearInterval(textTimer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <BerandaHero />

      {/* FLOATING PROFILE CARD */}
      <section className="relative z-20 -mt-8 md:-mt-24 px-4 md:px-6 pb-1 md:pb-2 flex justify-center">
        <div className="w-full max-w-[280px] md:max-w-lg bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-xl border-2 border-black p-3 md:p-6 text-center">
          {/* USER GREETING & POINTS */}
          <div className="flex flex-col items-center justify-center bg-white px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-black/10 shadow-sm mb-4 md:mb-6 mx-auto w-full gap-3">
            <div className="font-display font-bold text-primary text-sm md:text-lg truncate">
              Hi, {user?.name || "Sahabat LNR"}
            </div>
            
            {user && (
              <div className="flex items-center justify-between w-full bg-[#F9F6F0] rounded-xl px-3 py-2 border border-black/5">
                <div className="flex items-center gap-1.5">
                  <Star className="size-3.5 md:size-4 text-[#5C4033] fill-[#5C4033]" />
                  <span className="text-[11px] md:text-xs font-bold text-[#5C4033]">LNR Point : {points}</span>
                </div>
                <Link to="/points" className="text-[10px] md:text-[11px] font-bold bg-[#5C4033] text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-colors shadow-sm">
                  Tukarkan Point
                </Link>
              </div>
            )}
          </div>
          
          {/* LNR VOUCHER DENGAN ANIMASI BORDER */}
          <Link to="/vouchers" className="block w-full max-w-[280px] md:max-w-sm mx-auto mb-6 hover:-translate-y-1 transition-all duration-300">
            <div className="relative rounded-2xl overflow-hidden p-[2.5px] shadow-sm">
              {/* Efek animasi gradient berjalan di pinggiran */}
              <div 
                className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]" 
                style={{
                  background: 'conic-gradient(from 90deg at 50% 50%, transparent 0%, #5C4033 25%, transparent 50%, transparent 50%, #5C4033 75%, transparent 100%)'
                }}
              />
              
              {/* Konten Dalam (Kotak Putih yang menutupi bagian tengah) */}
              <div className="relative bg-white rounded-xl p-1.5 w-full h-full z-10 border border-black/5">
                <img 
                  src="/images/vocher-terbaru.png" 
                  alt="Voucher LNR" 
                  className="w-full h-[70px] md:h-[90px] object-cover object-center rounded-lg"
                />
              </div>
            </div>
          </Link>

          {/* MINI FEATURE BAR */}
          <div className="flex justify-center">
            <div className="flex items-center justify-between w-full gap-2 md:gap-8 bg-[#F9F6F0] px-3 md:px-8 py-2 md:py-2.5 rounded-full border border-black/10 shadow-inner">
              <Link to="/profile" className="flex flex-col items-center gap-1 group w-12 md:w-auto">
                <div className="grid size-8 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <User className="size-3.5 md:size-5" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold text-muted-foreground group-hover:text-[#5C4033] transition-colors">Akun</span>
              </Link>
              
              <div className="w-px h-6 md:h-8 bg-black/10"></div>
              
              <Link to="/orders" className="flex flex-col items-center gap-1 group w-12 md:w-auto">
                <div className="grid size-8 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <ClipboardList className="size-3.5 md:size-5" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold text-muted-foreground group-hover:text-[#5C4033] transition-colors">Pesanan</span>
              </Link>

              <div className="w-px h-6 md:h-8 bg-black/10"></div>
              
              <Link to="/pusat-bantuan" className="flex flex-col items-center gap-1 group w-12 md:w-auto">
                <div className="grid size-8 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <HelpCircle className="size-3.5 md:size-5" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold text-muted-foreground group-hover:text-[#5C4033] transition-colors">Bantuan</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ORDER ACTIONS */}
      <section className="relative z-20 px-4 md:px-6 pb-2 md:pb-3 pt-0">
        <div className="mx-auto w-full max-w-3xl bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-black p-6 md:p-8 text-center">
          <h2 className="font-display text-xl md:text-3xl font-bold text-primary mb-4 md:mb-6">
            Pesan LNR Coffee Sekarang?
          </h2>
          
          <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-xl mx-auto">
            <Link
              to="/select-location"
              search={{ type: "pickup" }}
              className="flex flex-col items-center justify-center gap-1.5 md:gap-4 aspect-square rounded-full bg-white p-3 md:p-6 border-2 border-black hover:-translate-y-1 hover:shadow-xl group"
            >
              <div className="grid size-10 md:size-16 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <ShoppingBag className="size-5 md:size-8" />
              </div>
              <div className="text-center">
                <div className="font-display text-base md:text-xl font-bold text-primary">Pick Up</div>
                <div className="mt-1 text-[10px] md:text-sm text-muted-foreground hidden sm:block">Pesan Tanpa Antri</div>
              </div>
            </Link>

            <Link
              to="/select-location"
              search={{ type: "delivery" }}
              className="flex flex-col items-center justify-center gap-1.5 md:gap-4 aspect-square rounded-full bg-white p-3 md:p-6 border-2 border-black hover:-translate-y-1 hover:shadow-xl group"
            >
              <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 transition-transform duration-300 relative">
                <img 
                  src="/images/driver-lnr-coffe.png" 
                  alt="Driver LNR" 
                  className="w-full h-full object-contain animate-ride drop-shadow-md"
                />
              </div>
              <div className="text-center">
                <div className="font-display text-base md:text-xl font-bold text-primary">Delivery</div>
                <div className="mt-1 text-[10px] md:text-sm text-muted-foreground hidden sm:block">Kirim pesanan ke alamatmu</div>
              </div>
            </Link>
          </div>

          <p key={headerTextIndex} className="text-xs md:text-base text-muted-foreground font-medium mt-4 md:mt-8 mb-4 md:mb-6 animate-in fade-in zoom-in duration-500">
            {headerTexts[headerTextIndex]}
          </p>

          {/* CARI OUTLET MAPS (DI DALAM KOTAK PESANAN) */}
          <a 
            href="https://www.google.com/maps/search/LNR+Coffee" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full max-w-xl mx-auto bg-[#F9F6F0] rounded-2xl border-2 border-black p-3 md:p-4 hover:-translate-y-1 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033] text-white">
                <MapPin className="size-5 md:size-6" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-sm md:text-lg font-bold text-[#5C4033] leading-none">Cari Lokasi Outlet</h3>
                <p className="text-[10px] md:text-xs text-[#5C4033]/70 font-medium mt-1">Terdekat di Google Maps</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#5C4033] font-bold text-xs md:text-sm group-hover:pr-1 transition-all">
              Cari <ChevronRight className="size-4 md:size-5" />
            </div>
          </a>
        </div>
        
        <style>{`
          @keyframes ride {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-5px) rotate(4deg) scale(1.05); }
          }
          .animate-ride {
            animation: ride 1.2s ease-in-out infinite;
          }
        `}</style>
      </section>

      <BerandaLayanan />

      {/* ACTIVE ORDER POPUP */}
      {activeOrder && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px] px-4">
          <Link 
            to="/order/$orderId" 
            params={{ orderId: activeOrder.id }}
            className="flex items-center justify-between gap-3 bg-accent text-accent-foreground p-3.5 rounded-[20px] shadow-2xl shadow-accent/20 border-2 border-accent animate-in slide-in-from-bottom-8 fade-in duration-500 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Coffee className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Status Pesanan</p>
                <p className="text-sm font-bold">Lacak pesananmu disini</p>
              </div>
            </div>
            <div className="bg-white/20 p-1 rounded-full">
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      )}

    </div>
  );
}
