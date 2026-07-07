import { useState, useEffect } from "react";
import { Ticket, X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type Voucher = {
  id: string;
  code: string;
  title: string;
  discount_type: "percent" | "percentage" | "fixed";
  discount_amount: number;
  min_order_amount: number;
};

const SYSTEM_VOUCHER: Voucher = {
  id: "system-newuser",
  code: "NEWUSER15",
  title: "Voucher Pengguna Baru",
  discount_type: "percentage",
  discount_amount: 15,
  min_order_amount: 0,
};

export function VoucherPicker({ 
  subtotal, 
  selectedVoucher, 
  onSelect 
}: { 
  subtotal: number;
  selectedVoucher: Voucher | null;
  onSelect: (v: Voucher | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vouchers.length === 0) {
      setLoading(true);
      supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            setVouchers([SYSTEM_VOUCHER, ...(data as Voucher[])]);
          } else {
            setVouchers([SYSTEM_VOUCHER]);
          }
          setLoading(false);
        });
    }
  }, [isOpen]);

  const calculateDiscount = (v: Voucher) => {
    if (v.discount_type === "percent" || v.discount_type === "percentage") {
      return (subtotal * v.discount_amount) / 100;
    }
    return v.discount_amount;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4 hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-accent text-white p-2 rounded-full">
            <Ticket className="size-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-accent">
              {selectedVoucher ? selectedVoucher.code : "Gunakan Voucher / Promo"}
            </div>
            {selectedVoucher && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Diskon Rp {calculateDiscount(selectedVoucher).toLocaleString("id-ID")}
              </div>
            )}
          </div>
        </div>
        <div className="text-accent font-medium">
          {selectedVoucher ? "Ubah" : "Pilih"}
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#F9F9F9] overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-center relative bg-white border-b border-border p-4">
            <button onClick={() => setIsOpen(false)} className="absolute left-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left size-6"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h2 className="text-lg font-bold">Pilih Voucher</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="size-8 animate-spin text-accent" />
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground bg-white rounded-2xl">
                <Ticket className="size-10 mx-auto mb-3 opacity-20" />
                <p>Tidak ada voucher yang tersedia saat ini.</p>
              </div>
            ) : (
              vouchers.map(v => {
                const eligible = subtotal >= v.min_order_amount;
                const isSelected = selectedVoucher?.id === v.id;
                
                const discountText = (v.discount_type === "percent" || v.discount_type === "percentage" as any) 
                  ? `Diskon ${v.discount_amount}%` 
                  : `Diskon Rp ${v.discount_amount.toLocaleString("id-ID")}`;
                
                return (
                  <div 
                    key={v.id} 
                    className={`relative overflow-hidden border-2 rounded-2xl p-4 transition-all ${
                      !eligible ? "opacity-60 bg-muted/30 border-muted grayscale" 
                      : isSelected ? "border-accent bg-accent/5" : "border-border bg-white hover:border-accent/30"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg">{v.title || v.code}</div>
                        <div className="text-sm font-semibold text-accent uppercase tracking-wider">{v.code}</div>
                      </div>
                      {isSelected && (
                        <div className="bg-accent text-white p-1 rounded-full shrink-0">
                          <Check className="size-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm font-bold text-[#5C4033] mb-1">
                      {discountText}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Min. belanja Rp {v.min_order_amount.toLocaleString("id-ID")}
                    </div>
                    
                    <div className="flex gap-2">
                      {eligible ? (
                        <button 
                          onClick={() => {
                            onSelect(isSelected ? null : v);
                            setIsOpen(false);
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                            isSelected ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-accent text-white hover:bg-accent/90"
                          }`}
                        >
                          {isSelected ? "Batalkan" : "Pakai Voucher"}
                        </button>
                      ) : (
                        <button disabled className="w-full py-2.5 rounded-xl font-bold text-sm bg-muted text-muted-foreground">
                          Belum Memenuhi Syarat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
