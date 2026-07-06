import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl font-bold">LNR<span className="text-accent">.</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Specialty coffee dengan sistem pesan QR per meja.</p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Kontak</div>
          <div className="text-muted-foreground">hello@lnrcoffee.id</div>
          <div className="text-muted-foreground">+62 812-3456-7890</div>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Sosial</div>
          <a href="#" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent">
            <Instagram className="size-4" /> @lnr.coffee
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LNR Coffee. Dibuat dengan ☕.
      </div>
    </footer>
  );
}
