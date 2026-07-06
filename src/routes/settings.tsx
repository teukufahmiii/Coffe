import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, MapPin, ShieldCheck, FileText, ChevronRight, ChevronLeft, Clock } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan & Aktivitas — LNR Coffee" },
      { name: "description", content: "Pengaturan dan aktivitas LNR Coffee." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {/* BACK BUTTON */}
        <div className="px-4 md:px-6 pt-6 md:pt-8 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#5C4033] hover:text-[#4A332A] font-bold transition-colors group">
            <div className="bg-[#5C4033]/10 p-1.5 rounded-full group-hover:bg-[#5C4033] group-hover:text-white transition-colors">
              <ChevronLeft className="size-5" />
            </div>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* PENGATURAN & AKTIVITAS */}
        <section className="relative z-20 px-4 md:px-6 pb-8 pt-6 md:pt-8">
          <div className="mx-auto w-full max-w-4xl bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-black p-4 md:p-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-primary mb-6">
              Pengaturan & Aktivitas
            </h2>
            
            <div className="flex flex-col gap-4">
              <Link to="/tentang" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <Info className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Tentang</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/lokasi" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <MapPin className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Outlet Kami</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Kebijakan & Privasi</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <FileText className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Syarat & Ketentuan</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </section>

        {/* AKTIVITAS TERAKHIR */}
        <section className="relative z-20 px-4 md:px-6 pb-24">
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="font-display text-xl font-bold text-primary mb-4 px-2">Aktivitas Terakhir</h2>
            <div className="bg-white rounded-3xl md:rounded-[2rem] border-2 border-black shadow-sm p-4 md:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#5C4033]/10 p-3 rounded-xl text-[#5C4033]">
                  <Clock className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-primary">Pesanan #LNR-1029</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Kemarin, 14:30 • Pick Up</div>
                </div>
                <div className="font-bold text-[#5C4033]">Rp 45.000</div>
              </div>
              <div className="h-px bg-black/10 w-full" />
              <div className="flex items-center gap-4 opacity-70">
                <div className="bg-black/5 p-3 rounded-xl text-muted-foreground">
                  <Clock className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-primary">Pesanan #LNR-0982</div>
                  <div className="text-xs md:text-sm text-muted-foreground">24 Okt 2026 • Delivery</div>
                </div>
                <div className="font-bold text-muted-foreground">Rp 112.000</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
