import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/testimoni")({
  component: TestimoniPage,
});

const TESTIMONIALS = [
  { quote: "Kopi susu gula arennya juara, suasananya bikin betah kerja seharian.", name: "Aisyah", role: "Designer" },
  { quote: "Sistem pesan QR-nya cepat banget, gak perlu antri panggil waiter.", name: "Rizky", role: "Founder" },
  { quote: "Tempat favorit untuk meeting santai. Espresso-nya konsisten.", name: "Dewi", role: "Konsultan" },
  { quote: "Tempat ngopi paling nyaman di area sini. Baristanya ramah dan tahu banget soal biji kopi yang mereka pakai.", name: "Budi", role: "Coffee Enthusiast" },
  { quote: "Suka banget sama interiornya, estetik parah buat foto-foto. Pilihan non-coffeenya juga enak-enak.", name: "Sari", role: "Mahasiswi" },
  { quote: "Setiap weekend pasti kesini bareng keluarga. LNR Coffee ngasih vibe santai yang bikin rileks dari kesibukan.", name: "Hendra", role: "Pekerja Kantoran" },
];

function TestimoniPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-24">
        <section className="bg-[#4A332A] py-24 text-[#F9F6F0] rounded-[2rem] mx-4 md:mx-10 mb-10 shadow-2xl">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373]">Testimoni Pelanggan</span>
              <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Apa kata mereka tentang kami</h2>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-transform hover:-translate-y-2 hover:shadow-xl">
                  <div className="mb-4 flex gap-1 text-[#D4A373]">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="size-5 fill-current" />)}
                  </div>
                  <p className="text-base leading-relaxed text-white/90">"{t.quote}"</p>
                  <div className="mt-6 text-sm font-semibold text-white/70">{t.name} · {t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
