import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearestBranch } from "@/hooks/useNearestBranch";
import { 
  ChevronLeft, 
  Search, 
  ShoppingBag, 
  Bike, // fallback for Motorcycle
  Coffee, 
  Croissant, 
  ChevronRight, 
  Loader2, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export const Route = createFileRoute("/select-location")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || "pickup",
      current: search.current as string | undefined,
    };
  },
  component: SelectLocation,
});

function SelectLocation() {
  const navigate = useNavigate();
  const { type, current } = useSearch({ from: "/select-location" });
  const { latitude, longitude, error, loading } = useGeolocation();
  
  // To avoid useNearestBranch crashing if it relies on exact coords, let's pass fallback null
  // But useGeolocation might return null for loading.
  const { data: branches, isLoading: loadingBranch } = useNearestBranch(latitude || null, longitude || null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredBranches = branches?.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelect = (slug: string) => {
    if (type === "pickup") {
      navigate({ to: "/pickup", search: { branch: slug } });
    } else {
      navigate({ to: "/delivery", search: { branch: slug } });
    }
  };

  const toggleType = () => {
    navigate({ to: "/select-location", search: { type: type === "pickup" ? "delivery" : "pickup", current } });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-20">
        <button onClick={() => navigate({ to: "/" })} className="p-1">
          <ChevronLeft className="size-6 text-[#5C4033]" />
        </button>
        <h1 className="font-bold text-[17px] text-[#5C4033]">LNR Coffee Store</h1>
        <button onClick={() => setShowSearch(!showSearch)} className="p-1">
          <Search className="size-6 text-[#5C4033]" />
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-3 bg-white border-b border-border/50 animate-in slide-in-from-top-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                 type="text" 
                 placeholder="Cari nama outlet atau lokasi..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 rounded-xl outline-none focus:ring-1 focus:ring-[#5C4033] text-sm text-[#5C4033] font-medium"
                 autoFocus
              />
           </div>
        </div>
      )}

      {/* Order Type Switcher */}
      <div className="px-4 py-4 bg-white flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-[#5C4033]/10 rounded-full flex items-center justify-center">
             {type === "pickup" ? <ShoppingBag className="size-6 text-[#5C4033]" /> : <Bike className="size-6 text-[#5C4033]" />}
          </div>
          <span className="font-bold text-[19px] text-[#5C4033]">{type === "pickup" ? "Pick Up" : "Delivery"}</span>
        </div>
        <button 
          onClick={toggleType}
          className="px-4 py-2 border border-[#5C4033] rounded-full text-xs font-bold text-[#5C4033] hover:bg-[#5C4033]/5 transition"
        >
          Ubah ke {type === "pickup" ? "Delivery" : "Pick Up"}
        </button>
      </div>

      {/* Store Count */}
      <div className="px-4 py-3 bg-[#F9F9F9] text-[13px] font-bold text-muted-foreground">
        {filteredBranches.length} Store
      </div>

      {/* Loading / Error States */}
      {(loading || loadingBranch) && (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#5C4033]" />
          <p className="text-sm font-semibold">Mendeteksi lokasi...</p>
        </div>
      )}

      {error && !loadingBranch && (
        <div className="flex flex-col items-center justify-center p-8 gap-3 text-destructive bg-white mx-4 rounded-xl border border-red-100">
          <AlertTriangle className="size-8" />
          <p className="text-sm font-semibold text-center">Gagal mendeteksi lokasi otomatis. Anda tetap dapat memilih outlet di bawah.</p>
        </div>
      )}

      {/* Store List */}
      <div className="bg-[#F9F9F9] pb-10 space-y-2">
        {filteredBranches.map((branch, idx) => {
          const isActive = branch.is_active ?? true;
          return (
            <div 
              key={branch.id} 
              onClick={() => isActive && handleSelect(branch.slug)} 
              className={`bg-white p-5 transition-colors ${isActive ? 'cursor-pointer hover:bg-secondary/10' : 'opacity-60 grayscale cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-bold text-[17px] text-[#5C4033]">{branch.name}</h3>
                {(current === branch.slug || (idx === 0 && !current && branch.distance !== undefined)) && isActive && (
                  <CheckCircle2 className="size-5 text-[#005B41] shrink-0" />
                )}
              </div>
              
              <p className="text-[13px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                LNR Coffee {branch.name} - {branch.address}
              </p>
              
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground mb-4">
                {branch.distance !== undefined ? (
                  <>
                    <span className="text-[#5C4033]">{branch.distance.toFixed(1)} km</span> dari lokasimu
                    {idx === 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="text-[#005B41] font-bold">Terdekat</span>
                      </>
                    )}
                  </>
                ) : (
                  <span>Jarak tidak diketahui</span>
                )}
              </div>
              
              <div className="flex items-center justify-between border-t border-dashed border-border pt-4">
                <div className="flex items-center gap-5">
                   <div className="flex items-center gap-2 text-[13px] font-bold text-[#5C4033]/80">
                     <ShoppingBag className="size-4" /> Pickup
                   </div>
                   <div className="flex items-center gap-2 text-[13px] font-bold text-[#5C4033]/80">
                     <Bike className="size-4" /> Delivery
                   </div>
                </div>
                <div className="flex items-center gap-3 text-[#5C4033]/60">
                  <Coffee className="size-4" />
                  <Croissant className="size-4" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 flex items-center justify-between border-t border-border/40">
                <div className="text-[13px]">
                  {isActive ? (
                    <>
                      <span className="text-[#005B41] font-bold mr-2">Buka</span>
                      <span className="text-[#5C4033] font-semibold">07:00 - 23:00</span>
                    </>
                  ) : (
                    <span className="text-destructive font-bold">Tutup Sementara</span>
                  )}
                </div>
                {isActive && <ChevronRight className="size-5 text-[#5C4033]" />}
              </div>
            </div>
          );
        })}
        
        {!loading && !loadingBranch && filteredBranches.length === 0 && (
          <div className="text-center p-12 text-muted-foreground">
            Outlet tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
