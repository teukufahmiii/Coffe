import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { MapPin, ShoppingBag, Ticket, Users, ChevronLeft, ChevronRight, User, Info, FileText, ShieldCheck, BookOpen, Clock, Bell, Settings, ClipboardList, Star, HelpCircle, MessageCircle, Coffee, Smartphone, X, PlayCircle, Gift, UserPlus } from "lucide-react";
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
  const defaultBanners = [
    { src: lnrPromo, scale: true },
    { src: lnrTumblerPromo, scale: false },
  ];
  const [bannerImages, setBannerImages] = useState<any[]>(defaultBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [headerTextIndex, setHeaderTextIndex] = useState(0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setBannerImages(data.map((b) => ({ src: b.image_url, scale: false })));
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) {
        setNotifications(data);
      }
    };
    fetchNotifications();
  }, []);

  const headerTexts = [
    "Mau menikmati Menu LNR yang mana nih?",
    "Pesan dengan Pick Up, pesan tanpa antri",
    "Pesan dengan LNR Driver, jaminan tepat waktu"
  ];

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      if (bannerImages.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
      }
    }, 5000);

    const textTimer = setInterval(() => {
      setHeaderTextIndex((prev) => (prev + 1) % headerTexts.length);
    }, 3000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(textTimer);
    };
  }, [bannerImages.length]);

  const nextSlide = () => {
    if (bannerImages.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }
  };

  const prevSlide = () => {
    if (bannerImages.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {bannerImages.length > 0 && (
        <section className="relative pt-6 md:pt-8 bg-background">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-2">
            <div className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-black aspect-[2/1]">
              {/* Notification Bell */}
              <Link 
                to="/notifications"
                className="absolute top-3 right-3 md:top-5 md:right-5 z-20 bg-white/90 hover:bg-white text-[#5C4033] p-2 rounded-full shadow-md backdrop-blur-sm transition-all border border-black/10 group/bell"
              >
                <div className="relative">
                  <Bell className="size-5 md:size-6 group-hover/bell:animate-bounce" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 size-3 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
              </Link>
              
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
                    className={`w-full h-full object-cover transition-transform duration-700 ${img.scale ? 'scale-105' : 'scale-100'}`}
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
      )}

      {/* FLOATING PROFILE CARD */}
      <section className="relative z-20 -mt-8 md:-mt-24 px-4 md:px-6 pb-1 md:pb-2 flex justify-center">
        <div className="w-full max-w-[280px] md:max-w-lg bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-xl border-2 border-black p-3 md:p-6 text-center">
          {/* USER GREETING & POINTS */}
          <div className="flex items-center justify-center bg-white px-4 py-2 md:py-3 rounded-xl md:rounded-2xl border-2 border-black/10 shadow-sm mb-3 md:mb-6 mx-auto w-full">
            <div className="font-display font-bold text-primary text-xs md:text-base truncate">
              Hi, {user?.name || "Sahabat LNR"}
            </div>
          </div>
          
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
              
              <Link to="/vouchers" className="flex flex-col items-center gap-1 group w-12 md:w-auto">
                <div className="grid size-8 md:size-11 place-items-center rounded-full bg-white text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-all duration-300 border border-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <Ticket className="size-3.5 md:size-5" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold text-muted-foreground group-hover:text-[#5C4033] transition-colors">Voucher</span>
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

      {/* SPECIAL UNTUKMU & LAINNYA (MERGED) */}
      <section className="relative z-20 px-4 md:px-6 pb-24 pt-0">
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

            {/* KOPIPEDIA BLOCK */}
            <Link 
              to="/kopipedia"
              className="flex flex-col items-center justify-center gap-2 bg-[#F9F6F0] rounded-2xl border-2 border-black p-3 md:p-5 hover:-translate-y-1 hover:shadow-lg transition-all text-center group"
            >
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <BookOpen className="size-5 md:size-6" />
              </div>
              <div>
                <h3 className="font-display text-sm md:text-lg font-bold text-primary mt-1">
                  KopiPedia
                </h3>
                <p className="mt-0.5 text-[9px] md:text-xs text-muted-foreground line-clamp-2 leading-tight">Jelajahi dunia kopi</p>
              </div>
              <div className="mt-auto pt-1 flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-bold text-[#5C4033]">
                Baca <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* TUTORIAL BLOCK */}
            <Link 
              to="/tutorial"
              className="flex flex-col items-center justify-center gap-2 bg-[#F9F6F0] rounded-2xl border-2 border-black p-3 md:p-5 hover:-translate-y-1 hover:shadow-lg transition-all text-center group"
            >
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <PlayCircle className="size-5 md:size-6" />
              </div>
              <div>
                <h3 className="font-display text-sm md:text-lg font-bold text-primary mt-1">
                  Tutorial
                </h3>
                <p className="mt-0.5 text-[9px] md:text-xs text-muted-foreground line-clamp-2 leading-tight">Cara pesan & fitur</p>
              </div>
              <div className="mt-auto pt-1 flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-bold text-[#5C4033]">
                Tonton <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* LNR REFERRAL BLOCK */}
            <Link 
              to="/referral"
              className="flex flex-col items-center justify-center gap-2 bg-[#F9F6F0] rounded-2xl border-2 border-black p-3 md:p-5 hover:-translate-y-1 hover:shadow-lg transition-all text-center group"
            >
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <UserPlus className="size-5 md:size-6" />
              </div>
              <div>
                <h3 className="font-display text-sm md:text-lg font-bold text-primary mt-1">
                  LNR Referral
                </h3>
                <p className="mt-0.5 text-[9px] md:text-xs text-muted-foreground line-clamp-2 leading-tight">Ajak teman dapat cuan</p>
              </div>
              <div className="mt-auto pt-1 flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-bold text-[#5C4033]">
                Undang <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* LNR GIFT BLOCK */}
            <Link 
              to="/gift"
              className="flex flex-col items-center justify-center gap-2 bg-[#F9F6F0] rounded-2xl border-2 border-black p-3 md:p-5 hover:-translate-y-1 hover:shadow-lg transition-all text-center group"
            >
              <div className="grid size-10 md:size-12 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                <Gift className="size-5 md:size-6" />
              </div>
              <div>
                <h3 className="font-display text-sm md:text-lg font-bold text-primary mt-1">
                  LNR Gift
                </h3>
                <p className="mt-0.5 text-[9px] md:text-xs text-muted-foreground line-clamp-2 leading-tight">Kirim hadiah kopi</p>
              </div>
              <div className="mt-auto pt-1 flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-bold text-[#5C4033]">
                Kirim <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* BANTUAN SECTION (FAQ & WA) */}
          <div className="mt-3 md:mt-6 w-full flex flex-col gap-3">
            {/* FAQ BUTTON */}
            <Link 
              to="/faq"
              className="flex items-center justify-center w-full gap-3 bg-[#F9F6F0] text-primary p-3 md:p-4 rounded-2xl border-2 border-black hover:-translate-y-1 hover:shadow-lg transition-all group"
            >
              <HelpCircle className="size-5 md:size-6 text-[#5C4033]" />
              <span className="font-display font-bold text-sm md:text-lg text-primary">FAQ & Bantuan</span>
            </Link>

            {/* BANTUAN WA LONG BUTTON */}
            <a 
              href="https://wa.me/628765214124"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full gap-3 bg-[#25D366] text-white p-3 md:p-4 rounded-2xl border-2 border-[#128C7E] hover:-translate-y-1 hover:shadow-lg transition-all group"
            >
              <MessageCircle className="size-5 md:size-6" />
              <span className="font-display font-bold text-sm md:text-lg">Hubungi WhatsApp</span>
            </a>
          </div>
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

