import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearestBranch } from "@/hooks/useNearestBranch";
import { MapPin, ArrowRight, Loader2, Navigation, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/select-location")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || "delivery",
    };
  },
  component: SelectLocation,
});

function SelectLocation() {
  const navigate = useNavigate();
  const { type } = useSearch({ from: "/select-location" });
  const { latitude, longitude, error, loading } = useGeolocation();
  const { data: branches, isLoading: loadingBranch } = useNearestBranch(latitude, longitude);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const nearestBranch = branches?.[0];
  const activeSlug = selectedSlug || nearestBranch?.slug;

  const handleContinue = () => {
    if (activeSlug) {
      if (type === "pickup") {
        navigate({ to: "/pickup", search: { branch: activeSlug } });
      } else {
        navigate({ to: "/delivery", search: { branch: activeSlug } });
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-accent/15 text-accent">
          <Navigation className="size-8" />
        </div>
        <h1 className="font-display text-2xl font-bold">Mencari Outlet Terdekat</h1>
        <p className="mt-2 text-sm text-muted-foreground">Kami sedang mendeteksi lokasimu untuk mencarikan outlet LNR Coffee terdekat.</p>

        <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6">
          {loading || loadingBranch ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin text-accent" />
              <span className="text-sm font-semibold">Mendeteksi lokasi...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-destructive">
              <AlertTriangle className="size-6" />
              <span className="text-sm font-semibold">Gagal mendeteksi lokasi</span>
              <span className="text-xs">{error}</span>
            </div>
          ) : branches && branches.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Pilih Outlet:</div>
              {branches.map((branch, idx) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedSlug(branch.slug)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${activeSlug === branch.slug ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-accent/50 bg-background'}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`size-5 ${idx === 0 ? 'text-accent' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="font-bold text-sm text-foreground">
                        {branch.name} {idx === 0 && <span className="ml-2 text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase">Terdekat</span>}
                      </div>
                      {branch.distance !== undefined && (
                        <div className="text-xs text-muted-foreground mt-0.5">{branch.distance.toFixed(1)} km dari lokasimu</div>
                      )}
                    </div>
                  </div>
                  <div className={`size-4 rounded-full border-2 flex items-center justify-center ${activeSlug === branch.slug ? 'border-accent bg-accent' : 'border-muted-foreground/30'}`}>
                    {activeSlug === branch.slug && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          ) : (
             <div className="text-sm text-muted-foreground">Outlet tidak ditemukan</div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!activeSlug || loading || loadingBranch}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-warm hover:opacity-90 disabled:opacity-50"
        >
          Lanjut Pesan <ArrowRight className="size-4" />
        </button>
        
        <Link to="/" className="mt-4 block text-sm font-semibold text-muted-foreground hover:text-foreground">
          Batal
        </Link>
      </div>
    </div>
  );
}
