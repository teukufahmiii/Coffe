import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { MapPin, ShoppingBag, Ticket, Users, ChevronLeft, ChevronRight, User, Info, FileText, ShieldCheck, BookOpen, Clock, Bell, Settings, ClipboardList, Star, HelpCircle, MessageCircle, Coffee, Smartphone } from "lucide-react";
import lnrLogo from "@/assets/logo.png";
import lnrPromo from "@/assets/lnr_promo.png";
import lnrBestsellers from "@/assets/lnr_bestsellers.png";
import lnrNewmenu from "@/assets/lnr_newmenu.png";
import lnrInterior from "@/assets/lnr_interior.png";
import lnrExterior from "@/assets/lnr_exterior.png";
import lnrNewBanner from "@/assets/lnr_new_banner.png";
import lnrTumblerPromo from "@/assets/lnr_tumbler_promo.png";
import { useAuth } from "@/hooks/useAuth";
import { KOPIPEDIA_ARTICLES } from "@/data/kopipedia";

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
  const bannerImages = [
    { src: lnrPromo, scale: true },
    { src: lnrTumblerPromo, scale: false },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [headerTextIndex, setHeaderTextIndex] = useState(0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const headerTexts = [
    "Mau menikmati Menu LNR yang mana nih?",
    "Pesan dengan Pick Up, pesan tanpa antri",
    "Pesan dengan LNR Driver, jaminan tepat waktu"
  ];

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4500);

    const textTimer = setInterval(() => {
      setHeaderTextIndex((prev) => (prev + 1) % headerTexts.length);
    }, 3000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(textTimer);
    };
  }, [bannerImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* BANNER SLIDER */}
      <section className="relative pt-6 md:pt-8 bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-2">
          <div className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-black aspect-[16/9]">
            {/* Notification Bell */}
            <button className="absolute top-3 right-3 md:top-5 md:right-5 z-20 bg-white/90 hover:bg-white text-[#5C4033] p-2 rounded-full shadow-md backdrop-blur-sm transition-all border border-black/10 group/bell">
              <div className="relative">
                <Bell className="size-5 md:size-6 group-hover/bell:animate-bounce" />
                <span className="absolute -top-1 -right-1 size-3 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
            </button>
            
            {/* Slides container */}
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full w-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerImages.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 relative">
                  <img 
                    src={img.src} 
                    alt={`Lnr Banner ${idx + 1}`} 
                    className={`w-full h-full object-cover ${img.scale ? 'scale-[1.15]' : ''}`}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-y-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/25 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {bannerImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`size-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING PROFILE CARD */}
      <section className="relative z-20 -mt-12 md:-mt-24 px-4 md:px-6 pb-1 md:pb-2">
        <div className="mx-auto w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-black p-4 md:p-6 text-center">
          {/* USER GREETING & POINTS */}
          <div className="flex items-center justify-center bg-white px-5 py-3 rounded-2xl border-2 border-black/10 shadow-sm mb-4 md:mb-6 mx-auto w-full max-w-sm">
            <div className="font-display font-bold text-primary text-sm md:text-base">
              Hi, {user?.name || "Sahabat LNR"}
            </div>
          </div>
          
          {/* MINI FEATURE BAR */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 md:gap-8 bg-[#F9F6F0] px-4 md:px-8 py-2.5 rounded-full border border-black/10 shadow-inner">
              <Link to="/profile" className="flex flex-col items-center gap-1 group">
                <div className="grid size-9 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <User className="size-4 md:size-5" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold text-muted-foreground group-hover:text-[#5C4033] transition-colors">Akun</span>
              </Link>
              
              <div className="w-px h-8 bg-black/10"></div>
              
              <Link to="/orders" className="flex flex-col items-center gap-1 group">
                <div className="grid size-9 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <ClipboardList className="size-4 md:size-5" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold text-muted-foreground group-hover:text-[#5C4033] transition-colors">Pesanan</span>
              </Link>


              <div className="w-px h-8 bg-black/10"></div>
              
              <Link to="/tentang" className="flex flex-col items-center gap-1 group">
                <div className="grid size-9 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <HelpCircle className="size-4 md:size-5" />
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
              search={{ type: "delivery" }}
              className="flex flex-col items-center justify-center gap-1.5 md:gap-4 rounded-2xl md:rounded-3xl bg-white p-3 md:p-6 border-2 border-black hover:-translate-y-1 hover:shadow-xl group"
            >
              <div className="grid size-10 md:size-16 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <MapPin className="size-5 md:size-8" />
              </div>
              <div className="text-center">
                <div className="font-display text-base md:text-xl font-bold text-primary">Delivery</div>
                <div className="mt-1 text-[10px] md:text-sm text-muted-foreground hidden sm:block">Kirim pesanan ke alamatmu</div>
              </div>
            </Link>
            
            <Link
              to="/select-location"
              search={{ type: "pickup" }}
              className="flex flex-col items-center justify-center gap-1.5 md:gap-4 rounded-2xl md:rounded-3xl bg-white p-3 md:p-6 border-2 border-black hover:-translate-y-1 hover:shadow-xl group"
            >
              <div className="grid size-10 md:size-16 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <ShoppingBag className="size-5 md:size-8" />
              </div>
              <div className="text-center">
                <div className="font-display text-base md:text-xl font-bold text-primary">Pick Up</div>
                <div className="mt-1 text-[10px] md:text-sm text-muted-foreground hidden sm:block">Ambil pesanan di kedai</div>
              </div>
            </Link>
          </div>

          <p key={headerTextIndex} className="text-xs md:text-base text-muted-foreground font-medium mt-4 md:mt-8 animate-in fade-in zoom-in duration-500">
            {headerTexts[headerTextIndex]}
          </p>
        </div>
      </section>

      {/* SPECIAL UNTUKMU */}
      <section className="relative z-20 px-4 md:px-6 pb-2 md:pb-3 pt-0">
        <div className="mx-auto w-full max-w-4xl bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-black p-4 md:p-8 text-center">
          <h2 className="font-display text-xl md:text-3xl font-bold text-primary mb-4 md:mb-8">
            Special untukmu di Lnr Coffe
          </h2>
          
          <div className="grid grid-cols-2 gap-3 md:gap-6 w-full">
            {/* LNR TUMBLER CARD */}
            <a 
              href="#"
              className="flex flex-col items-center justify-center gap-2 md:gap-3 rounded-2xl bg-[#F9F6F0] p-4 md:p-6 border-2 border-black hover:-translate-y-1 hover:shadow-lg transition-all text-center group cursor-pointer"
            >
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <Coffee className="size-5 md:size-6" />
              </div>
              <div>
                <div className="font-display text-sm md:text-lg font-bold text-primary">LNR Tumbler</div>
              </div>
              <div className="mt-1 md:mt-3 flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm font-bold text-[#5C4033]">
                Lihat <ChevronRight className="size-3 md:size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            
            {/* CATERING CARD */}
            <a 
              href="https://wa.me/6285813372092"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 md:gap-3 rounded-2xl bg-[#F9F6F0] p-4 md:p-6 border-2 border-black hover:-translate-y-1 hover:shadow-lg transition-all text-center group cursor-pointer"
            >
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <Users className="size-5 md:size-6" />
              </div>
              <div>
                <div className="font-display text-sm md:text-lg font-bold text-primary">Catering</div>
              </div>
              <div className="mt-1 md:mt-3 flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm font-bold text-[#5C4033]">
                Pesan <ChevronRight className="size-3 md:size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* LNR KOPIPEDIA */}
      <section className="relative z-20 px-0 md:px-6 pb-2 md:pb-3">
        <div className="mx-auto w-full max-w-4xl bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-y-2 md:border-2 border-black py-6 md:p-8">
          <div className="px-6 flex items-center justify-between mb-4 md:mb-8">
            <h2 className="font-display text-xl md:text-3xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="size-6 md:size-8" /> KopiPedia
            </h2>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-6 pb-4 gap-4">
            {KOPIPEDIA_ARTICLES.map((article) => (
              <Link 
                key={article.id}
                to={`/kopipedia/$articleId`}
                params={{ articleId: article.id }}
                className="min-w-[280px] md:min-w-[320px] max-w-[320px] flex-shrink-0 snap-center flex flex-col gap-3 rounded-2xl bg-[#F9F6F0] p-5 border-2 border-black hover:-translate-y-2 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#5C4033] text-white px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="size-3" /> {article.readTime}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-primary leading-tight group-hover:text-[#5C4033] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
                  {article.summary}
                </p>
                <div className="mt-2 text-sm font-bold text-[#5C4033] flex items-center gap-1">
                  Baca Selengkapnya <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* BUTUH BANTUAN */}
      <section className="relative z-20 px-4 md:px-6 pb-24 pt-0">
        <div className="mx-auto w-full max-w-sm bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 border-black p-4 md:p-5 text-center">
          <h2 className="font-display text-lg md:text-xl font-bold text-primary mb-3">
            Butuh bantuan?
          </h2>
          <a 
            href="https://wa.me/628765214124"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full gap-3 bg-[#F9F6F0] px-4 py-3 rounded-xl border-2 border-black hover:-translate-y-1 hover:shadow-lg transition-all group"
          >
            <div className="bg-[#25D366] p-2 rounded-full text-white shadow-sm flex-shrink-0">
              <MessageCircle className="size-5" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center">
              <span className="font-display font-bold text-primary text-sm">LNR customer service</span>
              <span className="text-xs font-bold text-[#5C4033] bg-white px-2 py-0.5 rounded-full border border-black/10">08765214124</span>
            </div>
          </a>
        </div>
      </section>

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

