import { X, Loader2 } from "lucide-react";
import { PaymentChannel } from "@/types/payment";

type PaymentMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  channels: PaymentChannel[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelect: (channel: PaymentChannel) => void;
  selectedChannelCode?: string;
};

export function PaymentMethodModal({ isOpen, onClose, channels, isLoading, isError, onRetry, onSelect, selectedChannelCode }: PaymentMethodModalProps) {
  if (!isOpen) return null;

  // Group channels by type
  const groups = channels.reduce((acc, channel) => {
    if (!acc[channel.group]) acc[channel.group] = [];
    acc[channel.group].push(channel);
    return acc;
  }, {} as Record<string, PaymentChannel[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-in fade-in" onClick={onClose}>
      <div 
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-background shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-xl font-bold">Pilih Pembayaran</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/80">
            <X className="size-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-accent mb-4" />
              <p className="text-sm text-muted-foreground">Memuat metode pembayaran Tripay...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-destructive mb-2">Gagal memuat metode pembayaran</p>
              <p className="text-xs text-muted-foreground mb-4">Pastikan Edge Function Tripay sudah deploy di Supabase.</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada metode pembayaran yang tersedia saat ini.
            </div>
          ) : (
            Object.entries(groups).map(([groupName, groupChannels]) => (
              <div key={groupName}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{groupName}</h3>
                <div className="space-y-2">
                  {groupChannels.map(channel => (
                    <button
                      key={channel.code}
                      onClick={() => onSelect(channel)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                        selectedChannelCode === channel.code 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                          : 'border-border hover:border-accent/50 hover:bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 border border-border/50">
                          <img src={channel.icon_url} alt={channel.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{channel.name}</div>
                          {channel.total_fee.flat > 0 && (
                            <div className="text-[10px] text-muted-foreground">
                              Biaya admin Rp {channel.total_fee.flat.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`size-4 rounded-full border-2 ${
                        selectedChannelCode === channel.code ? 'border-accent bg-accent' : 'border-muted-foreground/30'
                      }`}>
                        {selectedChannelCode === channel.code && <div className="m-auto size-1.5 rounded-full bg-white mt-[3px]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
