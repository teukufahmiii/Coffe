import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Navigation, Map as MapIcon, ChevronLeft } from "lucide-react";
import { useNearestBranch } from "@/hooks/useNearestBranch";

export const Route = createFileRoute("/nearest-outlets")({
  head: () => ({
    meta: [
      { title: "Cari Outlet Terdekat — LNR Coffee" },
    ],
  }),
  component: NearestOutletsPage,
});

function NearestOutletsPage() {
  const navigate = useNavigate();
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Jika koordinat belum ada, useNearestBranch akan mengembalikan semua cabang
  const { data: branches, isLoading } = useNearestBranch(lat, lng);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGeoError("Tidak dapat mengambil lokasi Anda. Menampilkan semua outlet.");
        }
      );
    } else {
      setGeoError("Browser Anda tidak mendukung geolokasi. Menampilkan semua outlet.");
    }
  }, []);

  const openGoogleMaps = (branch: any) => {
    if (branch.latitude && branch.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name + " " + branch.address)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col pb-24">
      {/* SIMPLE HEADER DENGAN TOMBOL KEMBALI */}
      <div className="bg-white px-4 py-4 md:px-6 shadow-sm border-b border-black/5 flex items-center sticky top-0 z-50">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="p-2 rounded-full hover:bg-black/5 transition-colors absolute left-4"
        >
          <ChevronLeft className="size-6 text-[#5C4033]" />
        </button>
        <h1 className="font-display font-bold text-lg md:text-xl text-[#5C4033] mx-auto">
          LNR Terdekat
        </h1>
      </div>
      
      <main className="flex-1 pt-6 md:pt-10 px-4 md:px-6 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-black/10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-[#5C4033]/10 p-4 rounded-full mb-4">
              <MapIcon className="size-8 text-[#5C4033]" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary mb-2">
              Outlet LNR Terdekat
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              Temukan cabang LNR Coffee terdekat dari lokasimu dan dapatkan rute via Google Maps.
            </p>
          </div>

          {geoError && !lat && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm mb-6 text-center">
              {geoError}
            </div>
          )}

          {!branches && isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C4033]"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {branches?.map((branch, index) => (
                <div 
                  key={branch.id} 
                  className={`bg-white rounded-2xl p-4 md:p-5 border-2 ${index === 0 && lat ? 'border-[#5C4033] shadow-md relative' : 'border-black/5 hover:border-black/10'}`}
                >
                  {index === 0 && lat && (
                    <div className="absolute -top-3 -right-3 md:-right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm border-2 border-white z-10">
                      Paling Dekat
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#5C4033]/10 p-2.5 rounded-xl text-[#5C4033] shrink-0 mt-1">
                        <MapPin className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-primary">{branch.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">
                          {branch.address}
                        </p>
                        {lat && (branch as any).distance !== undefined && (
                          <div className="mt-2 text-xs font-bold text-[#5C4033] bg-[#5C4033]/5 inline-block px-2 py-1 rounded-md">
                            Berjarak sekitar {((branch as any).distance).toFixed(1)} km
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => openGoogleMaps(branch)}
                      className="flex items-center justify-center gap-2 bg-[#5C4033] hover:bg-[#4A332A] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm shrink-0 w-full md:w-auto"
                    >
                      <Navigation className="size-4" />
                      Buka Google Maps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
