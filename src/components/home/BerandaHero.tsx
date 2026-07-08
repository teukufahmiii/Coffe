import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import lnrPromo from "@/assets/lnr_promo.png";
import lnrTumblerPromo from "@/assets/lnr_tumbler_promo.png";

export function BerandaHero() {
  const defaultBanners = [
    { src: lnrPromo, scale: true },
    { src: lnrTumblerPromo, scale: false },
  ];
  const [bannerImages, setBannerImages] = useState<any[]>(defaultBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

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

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      if (bannerImages.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
      }
    }, 5000);
    return () => clearInterval(bannerTimer);
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

  if (bannerImages.length === 0) return null;

  return (
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
  );
}
