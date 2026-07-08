import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
});

function MenuPage() {
  const [cat, setCat] = useState<"semua" | "coffee" | "non-coffee" | "snack">("semua");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedItem]);

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu-items", cat],
    queryFn: async () => {
      let query = supabase
        .from("menu_items")
        .select("*");
      
      if (cat !== "semua") {
        query = query.eq("category", cat);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-24 px-6">
        <div className="mx-auto max-w-5xl bg-white rounded-[2rem] shadow-xl border border-neutral-100 p-8 md:p-12">
          <div className="flex flex-col items-center text-center gap-8">
            <div>
              <h2 className="font-display text-4xl font-bold md:text-5xl text-primary">Menu LNR Coffee</h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "semua", label: "Semua Menu" },
                { id: "coffee", label: "Kopi Klasik" },
                { id: "hot-coffee", label: "Hot Coffee" },
                { id: "americano", label: "Americano" },
                { id: "non-coffee", label: "Non-Kopi" },
                { id: "snack", label: "Makanan" },
                { id: "makanan", label: "Makanan Berat" },
                { id: "tumbler", label: "Tumbler" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id as any)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
                    cat === c.id
                      ? "bg-[#5C4033] text-white"
                      : "bg-[#F6F3EC] text-foreground border border-border/50 hover:bg-[#EBE5D9]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(menuItems ?? []).map((m) => (
              <div 
                key={m.id} 
                onClick={() => setSelectedItem(m)}
                className="group cursor-pointer rounded-2xl border border-border/50 bg-[#F9F6F0] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 size-20 md:size-24 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm">
                  <img 
                    src={m.image_url || `/images/${m.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `/images/${m.category}.png`;
                    }}
                    alt={m.name} 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">{m.name}</h3>
                  <span className="text-sm font-bold text-[#5C4033]">{formatRupiah(m.price)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                <span className="mt-4 inline-block rounded-full bg-white px-2.5 py-1 border border-border/50 text-[10px] font-bold uppercase tracking-widest text-[#5C4033]">
                  {m.category}
                </span>
              </div>
            ))}
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border/50 bg-[#F9F6F0]" />
            ))}
            {!isLoading && menuItems?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Belum ada menu di kategori ini.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FULL PAGE DETAILS */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full md:hidden">
             {/* Mobile Edge-to-Edge Image */}
             <div className="aspect-square w-full bg-neutral-100">
               <img 
                  src={selectedItem.image_url || `/images/${selectedItem.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `/images/${selectedItem.category}.png`;
                  }}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
             </div>
             <button 
                onClick={() => setSelectedItem(null)}
                className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-black shadow-sm backdrop-blur-md hover:bg-white"
              >
                <ChevronLeft className="size-6" />
              </button>
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-col md:flex-row md:items-start md:py-16 md:px-8 md:gap-16 min-h-screen">
            
            {/* Desktop Image Section */}
            <div className="hidden md:block relative w-full md:w-1/2 md:sticky md:top-16 md:rounded-[2rem] md:overflow-hidden md:shadow-xl md:border md:border-black/5">
              <div className="aspect-square w-full bg-neutral-100">
                <img 
                  src={selectedItem.image_url || `/images/${selectedItem.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `/images/${selectedItem.category}.png`;
                  }}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-black shadow-sm backdrop-blur-md hover:bg-white"
              >
                <ChevronLeft className="size-6" />
              </button>
            </div>
            
            {/* Content Section */}
            <div className="flex flex-1 flex-col px-6 py-8 md:p-0 md:py-4 pb-32 md:pb-12">
              <button 
                onClick={() => setSelectedItem(null)}
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition"
              >
                <ChevronLeft className="size-4" /> Kembali ke Menu
              </button>

              <div>
                <div className="mb-4 inline-block rounded-full bg-[#F6F3EC] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#5C4033]">
                  {selectedItem.category}
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">{selectedItem.name}</h1>
                <div className="mt-4 text-3xl font-bold text-[#5C4033]">{formatRupiah(selectedItem.price)}</div>
              </div>
              
              <div className="mt-8 border-t border-black/5 pt-8 flex-1">
                <h3 className="font-display text-xl font-bold mb-4 text-primary">Deskripsi</h3>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">{selectedItem.description}</p>
              </div>

              {/* Floating order button on mobile, inline on desktop */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:static md:bg-transparent md:border-none md:shadow-none md:p-0 md:mt-12">
                 <button className="w-full rounded-full bg-[#5C4033] py-4 text-center font-bold text-white shadow-lg shadow-[#5C4033]/20 hover:bg-[#4A332A] transition-colors">
                   Tambah ke Keranjang
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
