import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import heroImg from "@/assets/hero-cafe.jpg";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — LNR Coffee" },
      { name: "description", content: "Kisah di balik LNR Coffee." },
    ],
  }),
  component: TentangPage,
});

function TentangPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-[112px] md:pt-[130px]">
        {/* ABOUT */}
        <section id="about" className="bg-[#F6F3EC] py-24 min-h-[calc(100vh-130px)] flex items-center">
          <div className="mx-auto max-w-6xl px-6 w-full">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div className="order-2 md:order-1 relative">
                <div className="aspect-square md:aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
                  <img src={heroImg} alt="Kisah LNR" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C4033]">Cerita LNR</span>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl text-primary">Lebih dari sekadar secangkir kopi.</h2>
                <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                  <p>
                    Berawal dari kecintaan pada aroma biji kopi segar di pagi hari, LNR Coffee lahir untuk menjadi ruang singgah yang nyaman bagi siapa saja.
                  </p>
                  <p>
                    Kami percaya bahwa setiap cangkir memiliki cerita. Oleh karena itu, kami bekerja sama dengan petani lokal untuk menghadirkan biji kopi terbaik yang diseduh dengan sepenuh hati.
                  </p>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border/20 pt-10">
                  <div>
                    <div className="font-display text-4xl font-bold text-[#5C4033]">100%</div>
                    <div className="mt-1 text-sm font-medium text-muted-foreground">Biji Kopi Asli Indonesia</div>
                  </div>
                  <div>
                    <div className="font-display text-4xl font-bold text-[#5C4033]">30+</div>
                    <div className="mt-1 text-sm font-medium text-muted-foreground">Varian Menu Spesial</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
