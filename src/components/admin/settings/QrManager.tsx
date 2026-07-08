import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function QrManager() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = origin; // Arahkan ke beranda website

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3 no-print">
        <div>
          <h1 className="font-display text-3xl font-bold">QR Website LNR</h1>
          <p className="text-sm text-muted-foreground">Satu QR Code untuk diarahkan langsung ke website LNR Coffee.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Printer className="size-4" /> Print QR
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-8 print:py-0">
        <div className="print-grid relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[2.5rem] border-[6px] border-primary bg-card p-10 shadow-2xl print:border-[8px] print:shadow-none">
          {/* Decorative background shapes */}
          <div className="absolute -left-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-12 -right-12 size-48 rounded-full bg-accent/10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              <Coffee className="size-3.5" /> Scan Me
            </div>
            <div className="mb-8 text-center font-display text-4xl font-black tracking-tight text-primary">
              LNR Coffee
            </div>
            
            <div className="rounded-3xl bg-white p-4 shadow-inner ring-4 ring-primary/10">
              <QRCodeSVG 
                value={url} 
                size={220} 
                level="H" 
                fgColor="#5C4033" // Warna coklat tema
                bgColor="#FFFFFF"
              />
            </div>
            
            <div className="mt-8 rounded-full border border-border bg-secondary/80 px-5 py-2 text-center text-sm font-bold tracking-wide text-foreground shadow-sm">
              {url.replace(/^https?:\/\//, '')}
            </div>
            
            <div className="mt-5 text-center text-xs font-semibold text-muted-foreground">
              Pesan kopi favoritmu langsung<br/>dari HP tanpa antri!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

