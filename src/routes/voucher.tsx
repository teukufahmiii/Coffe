import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Ticket, Clock, Info } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/voucher")({
  component: VoucherPage,
});

const MOCK_VOUCHERS = [
  {
    id: 1,
    title: "Voucher Pengguna Baru",
    description: "Diskon 50% hingga Rp 20.000 dengan minimal pembelian Rp 100.000.",
    validUntil: "Berlaku hingga 31 Des 2026",
    type: "Tersedia",
    tag: "Promo Khusus",
  },
  {
    id: 2,
    title: "Promo Payday",
    description: "Potongan harga Rp 15.000 untuk minimal transaksi Rp 50.000.",
    validUntil: "Berlaku hingga besok",
    type: "Tersedia",
    tag: "Gajian",
  },
  {
    id: 3,
    title: "Beli 1 Gratis 1 Aren Latte",
    description: "Khusus untuk varian Aren Latte ukuran Large.",
    validUntil: "Berlaku hari ini",
    type: "Tersedia",
    tag: "BOGO",
  },
  {
    id: 4,
    title: "Potongan Harga Rp 5.000",
    description: "Telah digunakan pada 24 Okt 2026",
    validUntil: "Sudah digunakan",
    type: "Riwayat",
    tag: "Umum",
  }
];

function VoucherPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"Tersedia" | "Riwayat">("Tersedia");

  const filteredVouchers = MOCK_VOUCHERS.filter(v => v.type === activeTab);

  return (
    <div className="min-h-screen bg-[#F6F3EC]">
      <main className="pt-8 md:pt-12 pb-24 px-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-black hover:text-[#5C4033] transition-colors"
          >
            <ChevronLeft className="size-5" />
            <span className="font-bold text-sm md:text-base">Kembali ke Beranda</span>
          </button>
        </div>
        
        <h1 className="font-display text-2xl font-bold text-primary mb-6">Voucher Anda</h1>

        {/* Tabs */}
        <div className="flex w-full mb-8 bg-white/50 p-1.5 rounded-full border border-border/50 shadow-sm">
          <button 
            onClick={() => setActiveTab("Tersedia")}
            className={`flex-1 text-sm font-bold py-2.5 rounded-full transition-all ${
              activeTab === "Tersedia" ? "bg-[#5C4033] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tersedia
          </button>
          <button 
            onClick={() => setActiveTab("Riwayat")}
            className={`flex-1 text-sm font-bold py-2.5 rounded-full transition-all ${
              activeTab === "Riwayat" ? "bg-[#5C4033] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Riwayat
          </button>
        </div>

        {/* Vouchers List */}
        <div className="flex flex-col gap-4">
          {filteredVouchers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Belum ada voucher di bagian ini.
            </div>
          ) : (
            filteredVouchers.map((voucher) => (
              <div 
                key={voucher.id} 
                className={`flex bg-white rounded-2xl shadow-sm border ${
                  activeTab === "Riwayat" ? "border-gray-200 opacity-60 grayscale" : "border-border/50"
                } overflow-hidden`}
              >
                {/* Left Ticket Stub */}
                <div className={`w-24 md:w-32 flex flex-col items-center justify-center border-r-2 border-dashed ${
                  activeTab === "Riwayat" ? "border-gray-300 bg-gray-100" : "border-[#EBE5D9] bg-[#F9F6F0]"
                } p-4 text-center shrink-0`}>
                  <Ticket className={`size-8 mb-2 ${activeTab === "Riwayat" ? "text-gray-400" : "text-[#5C4033]"}`} />
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                    activeTab === "Riwayat" ? "text-gray-500" : "text-[#5C4033]"
                  }`}>
                    {voucher.tag}
                  </span>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
                  <h3 className="font-display font-bold text-lg md:text-xl text-primary">{voucher.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 md:line-clamp-none">
                    {voucher.description}
                  </p>
                  
                  <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Clock className="size-3.5" />
                      {voucher.validUntil}
                    </div>
                    {activeTab === "Tersedia" && (
                      <button className="rounded-full bg-primary/10 px-5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors self-start md:self-auto">
                        Pakai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
