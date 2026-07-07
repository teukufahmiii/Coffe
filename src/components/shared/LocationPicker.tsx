import { useEffect, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

// Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export function LocationPicker({ currentBranch, path }: { currentBranch: string; path: string }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("branches").select("*").order("name").then(({ data }) => {
      if (data) setBranches(data);
    });
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let nearest: any = null;
        let minDistance = Infinity;

        branches.forEach(b => {
          if (b.latitude && b.longitude) {
            const dist = getDistanceFromLatLonInKm(latitude, longitude, b.latitude, b.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearest = b;
            }
          }
        });

        if (nearest) {
          toast.success(`Lokasi terdekat ditemukan: ${nearest.name}`);
          navigate({ to: path, search: { branch: nearest.slug } });
        } else {
          toast.error("Cabang dengan lokasi tidak ditemukan.");
        }
        setLoading(false);
      },
      (error) => {
        toast.error("Gagal mendapatkan lokasi. Izinkan akses lokasi di browser Anda.");
        setLoading(false);
      }
    );
  };

  const selected = branches.find(b => b.slug === currentBranch);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-black/10 mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent mb-1">Outlet Saat Ini</h2>
          <p className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <MapPin className="size-5" />
            {selected?.name || "Sedang memuat..."}
          </p>
        </div>
        <button 
          onClick={detectLocation}
          disabled={loading || branches.length === 0}
          className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Navigation className="size-5" />}
          <span className="hidden sm:inline">Gunakan Lokasi Terdekat</span>
        </button>
      </div>

      <div className="relative">
        <select 
          value={currentBranch}
          onChange={(e) => navigate({ to: path, search: { branch: e.target.value } })}
          className="w-full appearance-none bg-muted/50 border-2 border-border rounded-xl px-4 py-3 font-semibold text-primary focus:border-primary focus:outline-none"
        >
          {branches.map(b => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
