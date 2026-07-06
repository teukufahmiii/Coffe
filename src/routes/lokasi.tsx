import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/lokasi")({
  head: () => ({
    meta: [
      { title: "Lokasi Kami — LNR Coffee" },
      { name: "description", content: "Lokasi dan jam buka kedai LNR Coffee." },
    ],
  }),
  component: LokasiPage,
});

function LokasiPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-[112px] md:pt-[130px]">
        {/* LOCATION */}
        <section id="location" className="bg-[#F6F3EC] py-24 min-h-[calc(100vh-130px)] flex items-center">
          <div className="mx-auto max-w-6xl px-6 w-full">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C4033]">Lokasi & Jam Buka</span>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl text-primary">Temukan kami</h2>
                
                <div className="mt-10 space-y-8">
                  <div className="flex gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm text-[#5C4033]">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-primary">LNR Coffee Kemang</h3>
                      <p className="mt-1 text-muted-foreground">
                        Jl. Kemang Raya No. 12<br />
                        Jakarta Selatan
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm text-[#5C4033]">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-primary">LNR Coffee Senopati</h3>
                      <p className="mt-1 text-muted-foreground">
                        Jl. Senopati No. 45<br />
                        Jakarta Selatan
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm text-[#5C4033]">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-primary">Jam Operasional</h3>
                      <p className="mt-1 text-muted-foreground">
                        Setiap Hari<br />
                        08.00 - 22.00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126907.03964149952!2d106.7454955353597!3d-6.284201385412499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f14d30079f01%3A0x2e74f2341fff266d!2sJakarta%20Selatan%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1709827663249!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
