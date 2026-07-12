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
            {/* LNR AI ASSISTANT CARD - FULL IMAGE DESIGN */}
            <Link 
              to="/ai-assistant"
              className="group relative flex items-center justify-center w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-[#593922] border-2 border-black"
            >
              <img 
                src="/images/page-asisten-ai.jpg" 
                alt="LNR Asisten AI" 
                className="w-full h-full object-contain p-2 md:p-4 transition-transform duration-500" 
              />
            </Link>

            {/* LNR REFERRAL CARD */}
            <Link 
              to="/referral"
              className="group relative flex items-center justify-center w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-[#F9F6F0] border-2 border-black"
            >
              <img 
                src="/images/referral.png" 
                alt="LNR Referral" 
                className="w-full h-full object-contain p-2 md:p-4 transition-transform duration-500" 
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
