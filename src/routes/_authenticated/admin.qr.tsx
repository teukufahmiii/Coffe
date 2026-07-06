import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/_authenticated/admin/qr")({
  head: () => ({ meta: [{ title: "QR Meja — LNR Admin" }, { name: "robots", content: "noindex" }] }),
  component: QrPage,
});

function QrPage() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <AdminShell>
      <div className="mb-6 flex items-end justify-between gap-3 no-print">
        <div>
          <h1 className="font-display text-3xl font-bold">QR Meja</h1>
          <p className="text-sm text-muted-foreground">30 QR untuk dicetak dan ditempel di tiap meja.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Printer className="size-4" /> Print
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 print:grid-cols-3">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
          const url = `${origin}/table/${n}`;
          return (
            <div key={n} className="print-grid flex flex-col items-center rounded-2xl border border-border bg-card p-5 shadow-soft print:shadow-none">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">LNR Coffee</div>
              <div className="my-2 font-display text-3xl font-bold">Meja {n}</div>
              <div className="rounded-lg bg-white p-2">
                <QRCodeSVG value={url} size={140} level="M" />
              </div>
              <div className="mt-2 break-all text-center text-[9px] text-muted-foreground">{url}</div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
