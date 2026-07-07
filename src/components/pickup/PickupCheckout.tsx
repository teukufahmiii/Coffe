import { useState } from "react";
import { ChevronLeft, Store, ShoppingBag, Plus, Minus, Loader2, Clock, ChevronRight, Ticket } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { PaymentMethodModal } from "../delivery/PaymentMethodModal";
import { TermsCheckbox } from "../shared/TermsCheckbox";
import { Cart, CartTotals } from "@/types/cart";
import { PaymentChannel } from "@/types/payment";
import { toast } from "sonner";
import { useTripayChannels } from "@/hooks/useTripayChannels";
import { useAuth } from "@/hooks/useAuth";
import { User as UserIcon } from "lucide-react";
import { VoucherPicker, Voucher } from "../shared/VoucherPicker";

type PickupCheckoutProps = {
  branchSlug: string;
  cart: Cart;
  totals: CartTotals;
  adjustCartQty: (key: string, delta: number) => void;
  onClose: () => void;
  onSubmit: (details: {
    customerName: string;
    customerPhone: string;
    globalNote: string;
    paymentChannel: string;
    agreedTerms: boolean;
    voucherId?: string;
    discountAmount?: number;
  }) => Promise<void>;
  submitting: boolean;
};

export function PickupCheckout({ branchSlug, cart, totals, adjustCartQty, onClose, onSubmit, submitting }: PickupCheckoutProps) {
  const { user } = useAuth();
  const customerName = user?.name || "Pelanggan";
  const customerPhone = user?.phone || "-";
  
  const [globalNote, setGlobalNote] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  const { data: channels, isLoading: loadingChannels, isError: channelsError, refetch: refetchChannels } = useTripayChannels();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null);
  
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const voucherDiscount = selectedVoucher 
    ? ((selectedVoucher.discount_type === "percent" || selectedVoucher.discount_type === "percentage" as any) ? (totals.total * selectedVoucher.discount_amount) / 100 : selectedVoucher.discount_amount)
    : 0;

  const handleSubmit = () => {
    if (!selectedChannel) {
      toast.error("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    if (!agreedTerms) {
      toast.error("Silakan setujui Syarat & Ketentuan terlebih dahulu.");
      return;
    }

    onSubmit({
      customerName,
      customerPhone,
      globalNote,
      paymentChannel: selectedChannel.code,
      agreedTerms,
      voucherId: selectedVoucher?.id,
      discountAmount: voucherDiscount
    });
  };

  const totalFee = selectedChannel?.total_fee.flat || 0;
  const grandTotal = Math.max(0, totals.total - voucherDiscount + totalFee);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F9F9F9] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-center relative bg-white border-b border-border p-4">
        <button onClick={onClose} className="absolute left-4">
          <ChevronLeft className="size-6" />
        </button>
        <h2 className="text-lg font-bold">Checkout Pick Up</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 space-y-2">
        
        {/* Branch Info (Fore Style) */}
        <div className="bg-white p-4 pb-5">
          <h3 className="font-bold mb-3 text-[15px]">Ambil pesananmu di</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10">
                <Store className="size-5 text-[#5C4033]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[15px]">{branchSlug}</div>
                <div className="text-xs text-muted-foreground mt-0.5">- dari lokasimu</div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#5C4033]/10 px-3 py-2.5 mt-1 border border-[#5C4033]/20">
              <Clock className="size-4 text-[#5C4033]" />
              <span className="text-xs font-bold text-[#5C4033]">Estimasi siap diambil dalam 9 menit</span>
            </div>
          </div>
        </div>

        {/* Detail Pesanan */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-[15px] mb-4">Detail Pesanan</h3>
          {Object.entries(cart).map(([key, v]) => (
            <div key={key} className="flex flex-col gap-3 mb-4 last:mb-0 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                  <img 
                    src={v.image_url || `/images/${v.name.toLowerCase().replace(/\s+/g, '-')}.png`} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `/images/${(v as any).category || 'coffee'}.png`;
                    }}
                    alt={v.name} 
                    className="size-12 rounded-lg object-cover bg-secondary" 
                  />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium">{v.name}</div>
                  {v.note && <div className="text-xs text-muted-foreground mt-1">{v.note}</div>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                 <div className="text-[15px] font-bold">{formatRupiah((v as any).total_price || v.price)}</div>
                 <div className="flex items-center gap-4">
                    <div onClick={onClose} className="text-xs font-semibold text-[#5C4033] cursor-pointer hover:underline">Ubah</div>
                    <div className="inline-flex items-center gap-4 rounded-full border border-border px-1 py-1">
                      <button onClick={() => adjustCartQty(key, -1)} className="grid size-7 place-items-center rounded-full hover:bg-secondary"><Minus className="size-4" /></button>
                      <span className="w-2 text-center text-sm font-bold">{v.qty}</span>
                      <button onClick={() => adjustCartQty(key, 1)} className="grid size-7 place-items-center rounded-full hover:bg-secondary"><Plus className="size-4 text-[#5C4033]" /></button>
                    </div>
                 </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 pt-4 flex items-center justify-between">
            <div>
               <h4 className="font-bold text-[14px]">Ada tambahan lagi?</h4>
               <p className="text-[12px] text-muted-foreground mt-0.5">Kamu masih bisa tambahin menu lain, ya.</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-[#5C4033] px-5 py-1.5 text-xs font-bold text-[#5C4033] bg-white">
              Tambah
            </button>
          </div>
        </div>

        {/* Catatan Pesanan */}
        <div className="bg-white p-4 space-y-4">
          <h3 className="font-bold text-[15px]">Catatan Pesanan</h3>
          <textarea value={globalNote} onChange={(e) => setGlobalNote(e.target.value)} placeholder="Catatan tambahan (opsional)" className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-[#5C4033]" rows={2} />
        </div>

        {/* Voucher Diskon */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-[15px] mb-3">Voucher Diskon</h3>
          <VoucherPicker subtotal={totals.total} selectedVoucher={selectedVoucher} onSelect={setSelectedVoucher} />
        </div>

        {/* Metode Pembayaran */}
        <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[15px]">Metode Pembayaran</h3>
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-sm font-semibold text-[#5C4033] hover:underline"
            >
              {selectedChannel ? "Ubah" : "Pilih"}
            </button>
          </div>
          {selectedChannel ? (
            <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-white">
              <div className="flex items-center gap-3">
                <img src={selectedChannel.icon_url} alt={selectedChannel.name} className="h-6 object-contain" />
                <span className="font-semibold text-sm">{selectedChannel.name}</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          ) : (
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full flex items-center justify-between rounded-xl border border-border p-3 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="bg-secondary p-1.5 rounded-md"><Store className="size-4" /></div>
                Pilih Metode Pembayaran
              </div>
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
        
        <div className="bg-white p-4">
          <h3 className="font-bold text-[15px] mb-4">Rincian Pembayaran</h3>
          <div className="flex items-center justify-between text-[13px] mb-2.5">
              <span className="text-muted-foreground">Harga</span>
              <span>{formatRupiah(totals.total)}</span>
          </div>
          {selectedVoucher && (
            <div className="flex items-center justify-between text-[13px] mb-2.5">
                <span className="text-muted-foreground">Diskon Voucher</span>
                <span className="text-destructive">-{formatRupiah(voucherDiscount)}</span>
            </div>
          )}
          {totalFee > 0 && (
            <div className="flex items-center justify-between text-[13px] mb-2.5">
                <span className="text-muted-foreground">Biaya Layanan</span>
                <span>{formatRupiah(totalFee)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-[15px] font-bold pt-4 pb-2 border-t border-border border-dashed mt-2">
              <span>Total Pembayaran</span>
              <span>{formatRupiah(grandTotal)}</span>
          </div>
          
          <TermsCheckbox checked={agreedTerms} onChange={setAgreedTerms} />
        </div>
      </div>
      
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
         <button onClick={handleSubmit} disabled={submitting || totals.count === 0 || !agreedTerms} className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#5C4033] py-4 text-[15px] font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition">
          {submitting ? <Loader2 className="size-5 animate-spin" /> : null}
          Pesan Sekarang
        </button>
      </div>

      <PaymentMethodModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        channels={channels || []}
        isLoading={loadingChannels}
        isError={channelsError}
        onRetry={() => refetchChannels()}
        onSelect={(ch) => {
          setSelectedChannel(ch);
          setIsPaymentModalOpen(false);
        }}
        selectedChannelCode={selectedChannel?.code}
      />
    </div>
  );
}
