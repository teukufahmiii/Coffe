import { useState } from "react";
import { ChevronLeft, ChevronRight, Store, Plus, Minus, Loader2, MapPin } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { DriverSelector } from "./DriverSelector";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { DeliveryEstimation } from "./DeliveryEstimation";
import { TermsCheckbox } from "../shared/TermsCheckbox";
import { VoucherPicker, Voucher } from "../shared/VoucherPicker";
import { DriverType } from "@/types/order";
import { Cart, CartTotals } from "@/types/cart";
import { PaymentChannel } from "@/types/payment";
import { toast } from "sonner";
import { useTripayChannels } from "@/hooks/useTripayChannels";
import { detectCurrentLocation } from "@/services/locationService";

type DeliveryCheckoutProps = {
  branchSlug: string;
  cart: Cart;
  totals: CartTotals;
  adjustCartQty: (key: string, delta: number) => void;
  onClose: () => void;
  onSubmit: (details: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerLat?: number;
    customerLng?: number;
    globalNote: string;
    driverType: DriverType;
    paymentChannel: string;
    agreedTerms: boolean;
    voucherId?: string;
    discountAmount?: number;
  }) => Promise<void>;
  submitting: boolean;
};

export function DeliveryCheckout({ branchSlug, cart, totals, adjustCartQty, onClose, onSubmit, submitting }: DeliveryCheckoutProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerLat, setCustomerLat] = useState<number | undefined>();
  const [customerLng, setCustomerLng] = useState<number | undefined>();
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [globalNote, setGlobalNote] = useState("");
  const [driverType, setDriverType] = useState<DriverType>("gosend");
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const voucherDiscount = selectedVoucher 
    ? ((selectedVoucher.discount_type === "percent" || selectedVoucher.discount_type === "percentage" as any) ? (totals.total * selectedVoucher.discount_amount) / 100 : selectedVoucher.discount_amount)
    : 0;

  const { data: channels, isLoading: loadingChannels, isError: channelsError, refetch: refetchChannels } = useTripayChannels();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null);

  const handleSubmit = () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast.error("Data tidak lengkap", { description: "Mohon isi Nama, Nomor HP, dan Alamat Pengiriman." });
      return;
    }
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
      customerAddress,
      customerLat,
      customerLng,
      globalNote,
      driverType,
      paymentChannel: selectedChannel.code,
      agreedTerms,
      voucherId: selectedVoucher?.id,
      discountAmount: voucherDiscount
    });
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    toast.loading("Mendeteksi lokasi mu sekarang...", { id: "geo" });
    try {
      const { lat, lng, address } = await detectCurrentLocation();
      setCustomerAddress(address);
      setCustomerLat(lat);
      setCustomerLng(lng);
      toast.success("Lokasi berhasil dideteksi!", { id: "geo" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mendeteksi lokasi";
      toast.error("Gagal mendeteksi lokasi", { id: "geo", description: message });
    } finally {
      setDetectingLocation(false);
    }
  };

  const totalFee = selectedChannel?.total_fee.flat || 0;
  const grandTotal = Math.max(0, totals.total - voucherDiscount) + totalFee;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F9F9F9] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-center relative bg-white border-b border-border p-4">
        <button onClick={onClose} className="absolute left-4">
          <ChevronLeft className="size-6" />
        </button>
        <h2 className="text-lg font-bold">Checkout Delivery</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 space-y-2">
        {/* Combined Location Card */}
        <div className="bg-white p-4">
          <div className="rounded-[24px] border border-gray-200 bg-white p-2 shadow-sm relative">
            
            {/* Dotted Line */}
            <div className="absolute left-[43px] top-[60px] bottom-[60px] w-0 border-l-[2px] border-dotted border-gray-400"></div>

            {/* Top: Store */}
            <div className="flex items-center gap-4 p-3 relative bg-white rounded-t-2xl">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#EEF5F0] text-[#115E41]">
                <Store className="size-6" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[16px] truncate text-black">LNR Coffee {branchSlug}</div>
                <div className="text-[14px] font-medium text-gray-500 mt-0.5">Cabang Resto</div>
              </div>
              <ChevronRight className="size-5 text-black shrink-0" strokeWidth={2.5} />
            </div>

            {/* Horizontal Divider starting from text alignment */}
            <div className="ml-[76px] mr-3 border-t border-gray-200"></div>

            {/* Bottom: Customer Location */}
            <div 
              className="flex items-center gap-4 p-3 relative bg-white rounded-b-2xl cursor-pointer hover:bg-gray-50 transition-colors group"
              onClick={handleDetectLocation}
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#FFF5F2] text-[#994025]">
                {detectingLocation ? <Loader2 className="size-6 animate-spin" /> : <MapPin className="size-6" fill="currentColor" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[16px] truncate text-black">Lokasimu Saat Ini</div>
                <div className="text-[14px] font-medium text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                  {customerAddress || "Ketuk untuk mendeteksi lokasi..."}
                </div>
              </div>
              <ChevronRight className="size-5 text-black shrink-0" strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4">
            <textarea 
              value={globalNote} 
              onChange={(e) => setGlobalNote(e.target.value)} 
              placeholder="Detail alamat & patokan (Cth: Blok, RT/RW, Warna Pagar)..." 
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] outline-none focus:border-[#5C4033] focus:bg-white transition-colors" 
              rows={2} 
            />
          </div>
        </div>

        <div className="bg-white p-4 space-y-4">
          <h3 className="font-bold">Data Penerima</h3>
          <input type="text" placeholder="Nama Penerima" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-[#5C4033]" required />
          <input type="tel" placeholder="Nomor HP / WhatsApp" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-[#5C4033]" required />
        </div>

        {/* Voucher Diskon */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-[15px] mb-3">Voucher Diskon</h3>
          <VoucherPicker subtotal={totals.total} selectedVoucher={selectedVoucher} onSelect={setSelectedVoucher} />
        </div>

        <div className="bg-white p-4">
          <DriverSelector selected={driverType} onSelect={setDriverType} />
        </div>

        <div className="bg-white p-4">
          <h3 className="font-bold text-lg mb-4">Detail Pesanan</h3>
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
                  <div className="text-base font-medium">{v.name}</div>
                  {v.note && <div className="text-xs text-muted-foreground mt-1">{v.note}</div>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                 <div className="text-base font-bold">{formatRupiah((v as any).total_price || v.price)}</div>
                 <div className="flex items-center gap-4">
                    <div onClick={onClose} className="text-xs font-semibold text-[#5C4033] cursor-pointer hover:underline">Ubah</div>
                    <div className="inline-flex items-center gap-3 rounded-full border border-border px-1 py-1">
                      <button onClick={() => adjustCartQty(key, -1)} className="grid size-7 place-items-center rounded-full hover:bg-secondary"><Minus className="size-4" /></button>
                      <span className="w-4 text-center text-sm font-bold">{v.qty}</span>
                      <button onClick={() => adjustCartQty(key, 1)} className="grid size-7 place-items-center rounded-full hover:bg-secondary"><Plus className="size-4" /></button>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Metode Pembayaran</h3>
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-sm font-semibold text-[#5C4033] hover:underline"
            >
              {selectedChannel ? "Ubah" : "Pilih"}
            </button>
          </div>
          {selectedChannel ? (
            <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-secondary/20">
              <img src={selectedChannel.icon_url} alt={selectedChannel.name} className="h-6 object-contain" />
              <span className="font-semibold text-sm">{selectedChannel.name}</span>
            </div>
          ) : (
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full rounded-xl border border-dashed border-[#5C4033]/50 bg-[#5C4033]/5 p-4 text-sm font-semibold text-[#5C4033]"
            >
              + Pilih Metode Pembayaran
            </button>
          )}
        </div>
        
        <div className="bg-white p-4">
          <h3 className="font-bold mb-4">Rincian Pembayaran</h3>
          <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Subtotal Makanan</span>
              <span>{formatRupiah(totals.total)}</span>
          </div>
          {totalFee > 0 && (
            <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">Biaya Layanan</span>
                <span>{formatRupiah(totalFee)}</span>
            </div>
          )}
          {selectedVoucher && (
            <div className="flex items-center justify-between text-[13px] mb-3">
                <span className="text-muted-foreground">Diskon Voucher</span>
                <span className="text-destructive">-{formatRupiah(voucherDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-bold pt-3 border-t border-border">
              <span>Total Pembayaran</span>
              <span className="text-[#5C4033]">{formatRupiah(grandTotal)}</span>
          </div>
          
          <TermsCheckbox checked={agreedTerms} onChange={setAgreedTerms} />
        </div>
      </div>
      
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
         <button onClick={handleSubmit} disabled={submitting || totals.count === 0 || !agreedTerms} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5C4033] py-3.5 text-base font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition">
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
