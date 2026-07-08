import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ShoppingBag, Users, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/tutorial")({
  component: TutorialPage,
});

function TutorialPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <Link to="/" className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1 text-center">
            <div className="font-display text-lg font-bold">Cara Pesan</div>
          </div>
          <div className="size-10" /> {/* Balancer */}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        
        {/* PICK UP TUTORIAL */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#5C4033]/10 text-[#5C4033]">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary">Cara Pesan Pick Up</h2>
              <p className="text-sm text-muted-foreground">Pesan dari mana saja, ambil di kedai tanpa antri.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Step number={1} title="Pilih Lokasi Kedai" desc="Pilih cabang LNR Coffee terdekat dari lokasimu." />
            <Step number={2} title="Pilih Menu Favorit" desc="Pilih minuman atau makanan yang ingin kamu pesan." />
            <Step number={3} title="Checkout & Bayar" desc="Selesaikan pembayaran menggunakan metode pilihanmu." />
            <Step number={4} title="Ambil Pesanan" desc="Datang ke kedai saat pesanan siap dan tunjukkan kode pesanan ke barista." />
          </div>
          <div className="mt-6 text-center">
            <Link to="/select-location" search={{ type: "pickup" }} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Mulai Pesan Pick Up <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* DELIVERY TUTORIAL */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#5C4033]/10 text-[#5C4033]">
              <MapPin className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary">Cara Pesan Delivery</h2>
              <p className="text-sm text-muted-foreground">Kopi segar diantar langsung ke lokasimu oleh kurir kami.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Step number={1} title="Tentukan Lokasi Pengiriman" desc="Masukkan alamat pengiriman dengan lengkap dan detail." />
            <Step number={2} title="Pilih Menu" desc="Pilih pesananmu dari cabang LNR Coffee terdekat." />
            <Step number={3} title="Bayar & Tunggu" desc="Selesaikan pembayaran. Kurir akan segera mengantar pesananmu." />
            <Step number={4} title="Pesanan Tiba" desc="Terima pesanan dari kurir dan nikmati LNR Coffee-mu!" />
          </div>
          <div className="mt-6 text-center">
            <Link to="/select-location" search={{ type: "delivery" }} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Mulai Pesan Delivery <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* CATERING TUTORIAL */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#5C4033]/10 text-[#5C4033]">
              <Users className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary">Cara Pesan Catering</h2>
              <p className="text-sm text-muted-foreground">Cocok untuk acara skala besar, ulang tahun, meeting, atau event lainnya.</p>
            </div>
          </div>
          <div className="bg-[#F9F6F0] rounded-2xl p-4 mb-6 text-sm text-muted-foreground border border-black/5 leading-relaxed">
            <strong className="text-primary block mb-1">Kenapa Catering LNR Coffee?</strong>
            Kami menyediakan layanan pemesanan skala besar untuk mendukung berbagai acara pentingmu. Mulai dari meeting kantor, perayaan ulang tahun, hingga event komunitas, nikmati sajian kopi dan menu terbaik LNR langsung di lokasi acaramu.
          </div>
          <div className="space-y-4">
            <Step number={1} title="Hubungi Admin" desc="Klik tombol pesan catering untuk terhubung langsung dengan admin kami via WhatsApp." />
            <Step number={2} title="Konsultasi Menu & Harga" desc="Sampaikan jumlah peserta dan menu yang diinginkan. Dapatkan penawaran harga spesial." />
            <Step number={3} title="Konfirmasi & Pembayaran" desc="Setelah deal, lakukan pembayaran DP/Lunas sesuai kesepakatan." />
            <Step number={4} title="Sajian Tiba di Acara" desc="Tim LNR Coffee akan menyiapkan dan mengantar (atau setup) pesanan tepat waktu di lokasimu." />
          </div>
          <div className="mt-6 text-center">
            <a href="https://wa.me/6285813372092" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md shadow-[#25D366]/20">
              Konsultasi Catering via WA <ChevronRight className="size-4" />
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start relative group">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary font-bold text-sm z-10 border border-background">
        {number}
      </div>
      <div className="pb-4">
        <h3 className="font-display font-semibold text-primary">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  );
}
