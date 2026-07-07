import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Ticket } from "lucide-react";
import { toast } from "sonner";
import voucherIcon from "@/assets/lnr_logo.png"; // We can just use the lnr logo as a placeholder icon or Ticket

export const Route = createFileRoute("/vouchers")({
  component: VouchersPage,
});

type Voucher = {
  id: string;
  code: string;
  title: string | null;
  discount_type: "percentage" | "fixed";
  discount_amount: number;
  min_order_amount: number;
  valid_until: string | null;
};

function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [claimingVoucher, setClaimingVoucher] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .eq("is_visual", true)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat voucher");
      } else {
        setVouchers(data || []);
      }
      setLoading(false);
    };

    fetchVouchers();
  }, []);

  const handleClaimVisual = (code: string) => {
    toast.success(`Voucher ${code} berhasil disalin! Silakan gunakan saat checkout.`);
    navigator.clipboard.writeText(code);
  };

  const handleClaimManual = async () => {
    if (!voucherCode.trim()) {
      toast.error("Masukkan kode voucher terlebih dahulu");
      return;
    }

    setClaimingVoucher(true);
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", voucherCode.toUpperCase().replace(/\s/g, ''))
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast.error("Voucher tidak ditemukan atau sudah tidak aktif");
    } else {
      toast.success(`Voucher ${data.code} berhasil diklaim!`);
      setVoucherCode("");
    }
    setClaimingVoucher(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="p-2 hover:bg-accent/10 rounded-full transition-colors text-[#5C4033]">
          <ChevronLeft className="size-6" />
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg md:text-xl font-bold text-[#5C4033]">Voucher Belanja</h1>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 mx-auto w-full max-w-lg">
        {/* MANUAL VOUCHER INPUT (UI ONLY - DISABLED) */}
        <div className="mb-6 bg-white p-4 rounded-3xl border border-[#5C4033]/10 shadow-sm">
          <h2 className="font-bold text-[#5C4033] mb-3 text-sm md:text-base">Punya Kode Promo LNR?</h2>
          <div className="flex items-center bg-[#F9F6F0] rounded-full border border-[#5C4033]/20 shadow-inner px-2 py-1.5 md:py-2">
            <Ticket className="size-4 md:size-5 text-[#5C4033] ml-2 mr-1" />
            <input 
              type="text" 
              placeholder="Masukkan kode voucher..."
              className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm font-semibold text-[#5C4033] placeholder:text-[#5C4033]/50 px-2 uppercase"
            />
            <button 
              onClick={() => toast.error("Fitur pencarian kode manual sedang dinonaktifkan.")}
              className="bg-[#5C4033] hover:bg-[#4a332a] text-white text-[10px] md:text-xs font-bold px-4 py-1.5 md:py-2 rounded-full transition-colors"
            >
              Klaim
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C4033]"></div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#5C4033]/10 p-4 rounded-full mb-4">
              <Ticket className="size-12 text-[#5C4033]" />
            </div>
            <h2 className="text-xl font-bold text-[#5C4033] mb-2">Belum ada Voucher</h2>
            <p className="text-sm text-muted-foreground">Promo terbaru akan muncul di sini nanti.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-[#5C4033] font-bold text-lg">Tersedia untuk Anda</h2>
              <span className="text-xs text-muted-foreground">{vouchers.length} voucher</span>
            </div>
            
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="relative bg-gradient-to-r from-white to-[#F9F6F0] rounded-2xl shadow-sm border border-[#5C4033]/10 overflow-hidden">
                {/* Dotted border separators */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#F9F6F0] border-r border-[#5C4033]/10 rounded-full -translate-y-1/2 z-10"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#F9F6F0] border-l border-[#5C4033]/10 rounded-full -translate-y-1/2 z-10"></div>
                
                {/* Top Section */}
                <div className="p-4 md:p-5 flex gap-4 border-b-2 border-dashed border-[#5C4033]/20 relative">
                  <div className="flex-1">
                    <h3 className="font-bold text-[15px] md:text-base text-[#5C4033] leading-tight mb-1">
                      {voucher.title ? voucher.title : `Diskon ${voucher.discount_type === 'percentage' ? voucher.discount_amount + '%' : 'Rp ' + voucher.discount_amount.toLocaleString('id-ID')}`}
                    </h3>
                    <p className="text-xs text-[#5C4033]/70 font-medium flex items-center gap-1">
                      <Ticket className="size-3.5" /> {voucher.code}
                    </p>
                  </div>
                  <div className="size-12 rounded-full bg-[#5C4033]/5 grid place-items-center shrink-0 border border-[#5C4033]/10">
                    <Ticket className="size-6 text-[#5C4033]" />
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="p-4 md:p-5 flex justify-between items-center bg-white/50">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Berlaku Hingga</p>
                      <p className="text-xs font-bold text-[#5C4033]">
                        {voucher.valid_until ? new Date(voucher.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Selamanya'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Min Transaksi</p>
                      <p className="text-xs font-bold text-[#5C4033]">
                        {voucher.min_order_amount > 0 ? `Rp ${voucher.min_order_amount.toLocaleString('id-ID')}` : '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaimVisual(voucher.code)}
                    className="bg-[#5C4033] hover:bg-[#4a332a] text-white text-xs font-bold px-5 py-2 rounded-full transition-all shadow-sm active:scale-95"
                  >
                    Pakai
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
