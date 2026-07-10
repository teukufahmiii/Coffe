import { formatCurrency } from "@/lib/utils";

interface ReceiptPrintProps {
  order: any;
  items: any[];
  branch: any;
}

export function ReceiptPrint({ order, items, branch }: ReceiptPrintProps) {
  if (!order) return null;

  const date = new Date(order.created_at).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="hidden print:block font-mono text-black w-[58mm] mx-auto text-sm bg-white p-4">
      {/* HEADER */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-xl mb-1">LNR Coffee</h1>
        <p className="text-xs">{branch?.name || "Cabang"}</p>
        <p className="text-xs break-words">{branch?.address || ""}</p>
        <div className="border-b border-dashed border-black my-2" />
      </div>

      {/* INFO */}
      <div className="text-xs mb-4">
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between">
          <span>Antrean / ID:</span>
          <span>#{order.queue_number || order.id.split("-")[0]}</span>
        </div>
        <div className="flex justify-between">
          <span>Tipe:</span>
          <span className="uppercase">{order.order_source === 'pos' ? 'kasir' : order.order_type}</span>
        </div>
        <div className="flex justify-between">
          <span>Metode:</span>
          <span className="uppercase">{order.payment_channel}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black mb-2" />

      {/* ITEMS */}
      <div className="text-xs mb-4">
        {items.map((item, idx) => (
          <div key={idx} className="mb-2">
            <div className="font-semibold">{item.name}</div>
            <div className="flex justify-between">
              <span>{item.qty} x {formatCurrency(item.price)}</span>
              <span>{formatCurrency(item.price * item.qty)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black mb-2" />

      {/* TOTALS */}
      <div className="text-xs mb-4">
        <div className="flex justify-between font-bold text-base mt-2">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
      
      <div className="border-b border-dashed border-black mb-4" />

      {/* FOOTER */}
      <div className="text-center text-xs space-y-1">
        <p className="font-bold">TERIMA KASIH</p>
        <p>Silakan berkunjung kembali</p>
        <p className="text-[10px] mt-2">Powered by LNR Kasir</p>
      </div>

      {/* Print Specific Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
