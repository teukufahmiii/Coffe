import { Link } from "@tanstack/react-router";
import { Users, BookOpen, PlayCircle, MapPin, ChevronRight, MessageCircle, Bot, Sparkles, Gift } from "lucide-react";

export function BerandaLayanan() {
  return (
    <section className="relative z-20 px-4 md:px-6 pb-24 pt-0">
      <div className="mx-auto w-full max-w-4xl bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-black p-4 md:p-8 text-center">
        <h2 className="font-display text-xl md:text-3xl font-bold text-primary mb-4 md:mb-8">
          Lainnya
        </h2>
        
        <div className="grid grid-cols-2 gap-3 md:gap-6 w-full">

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

        </div>

        {/* BANTUAN SECTION (WA & AI) */}
        <div className="mt-3 md:mt-6 w-full flex flex-col gap-3">
          
          <div className="grid grid-cols-2 gap-3 md:gap-6 w-full">
            {/* LNR AI ASSISTANT PREMIUM CARD */}
            <Link 
              to="/ai-assistant"
              className="group relative flex flex-col w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              {/* Animated Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#5C4033] via-[#D4AF37] to-[#5C4033] opacity-50 group-hover:opacity-100 bg-[length:200%_auto] animate-[gradient-x_3s_linear_infinite] transition-opacity duration-500"></div>
              
              {/* Inner Dark Card */}
              <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#1C120C] to-[#3A2417] m-[2px] rounded-[calc(1.5rem-2px)] md:rounded-[calc(2rem-2px)] p-3 md:p-6 overflow-hidden">
                
                {/* Glowing decorative orbs */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl group-hover:bg-[#D4AF37]/40 transition-all duration-500"></div>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#8B5A2B]/30 rounded-full blur-2xl group-hover:bg-[#8B5A2B]/50 transition-all duration-500"></div>

                {/* Character Image (Top) */}
                <div className="relative z-10 h-16 md:h-24 w-auto flex-shrink-0 animate-[ride_2s_ease-in-out_infinite] mb-2">
                  <img 
                    src="/images/lnr-asisten-ai.png" 
                    alt="LNR Asisten AI" 
                    className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>

                {/* Text Content (Bottom) */}
                <div className="relative z-10 flex flex-col items-center text-center gap-1">
                  <h3 className="font-display font-black text-sm md:text-xl text-white leading-tight">
                    LNR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFF1C5]">Asisten</span>
                  </h3>
                </div>
              </div>
            </Link>

            {/* LNR REFERRAL CARD */}
            <Link 
              to="/referral"
              className="group relative flex items-center justify-center w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-[#F9F6F0] border-2 border-transparent"
            >
              <img 
                src="/images/referral.png" 
                alt="LNR Referral" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </Link>
          </div>
          
          <style>{`
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

          {/* BANTUAN WA LONG BUTTON */}
          <a 
            href="https://wa.me/628765214124"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full gap-3 bg-[#25D366] text-white p-3 md:p-4 rounded-2xl border-2 border-[#128C7E] hover:-translate-y-1 hover:shadow-lg transition-all group"
          >
            <img src="/images/wa-logo.webp" alt="WhatsApp" className="size-8 md:size-10 object-contain drop-shadow-sm" />
            <span className="font-display font-bold text-sm md:text-lg">Customer Services</span>
          </a>
        </div>
      </div>
    </section>
  );
}
