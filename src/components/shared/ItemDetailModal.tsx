import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { renderIcon } from "@/lib/icons";

type ItemDetailModalProps = {
  selectedItem: any;
  setSelectedItem: (item: any | null) => void;
  onAdd: (item: any) => void;
};

export function ItemDetailModal({ selectedItem, setSelectedItem, onAdd }: ItemDetailModalProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (selectedItem?.options) {
      const init: Record<string, string[]> = {};
      selectedItem.options.forEach((opt: any) => {
        if (opt.type === "wajib" && opt.choices?.length > 0) {
          init[opt.name] = [opt.choices[0].name];
        } else {
          init[opt.name] = [];
        }
      });
      setSelections(init);
    } else {
      setSelections({});
    }
  }, [selectedItem]);

  if (!selectedItem) return null;

  const handleSelect = (optName: string, type: "wajib" | "opsional", choiceName: string) => {
    setSelections(prev => {
      if (type === "wajib") {
        return { ...prev, [optName]: [choiceName] };
      } else {
        const current = prev[optName] || [];
        if (current.includes(choiceName)) {
          return { ...prev, [optName]: current.filter(c => c !== choiceName) };
        } else {
          return { ...prev, [optName]: [...current, choiceName] };
        }
      }
    });
  };

  const calculateTotal = () => {
    let total = selectedItem.price;
    if (!selectedItem.options) return total;
    
    selectedItem.options.forEach((opt: any) => {
      const selected = selections[opt.name] || [];
      selected.forEach((selName: string) => {
        const choice = opt.choices.find((c: any) => c.name === selName);
        if (choice) {
          total += choice.price_diff;
        }
      });
    });
    return total;
  };
  
  const totalPrice = calculateTotal();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row md:items-start md:py-12 md:px-6 md:gap-12 lg:gap-16 min-h-screen">
        
        {/* Image Section */}
        <div className="relative w-full md:w-1/2 md:sticky md:top-12 md:rounded-3xl md:overflow-hidden md:shadow-2xl md:border md:border-border">
          <div className="aspect-square w-full bg-accent/10">
            <img 
              src={selectedItem.image_url || `/images/${selectedItem.name.toLowerCase().replace(/\s+/g, '-')}.png`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `/images/${selectedItem.category}.png`;
              }}
              alt={selectedItem.name}
              className="h-full w-full object-contain"
            />
          </div>
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 md:hidden"
          >
            <ArrowLeft className="size-6" />
          </button>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-1 flex-col px-6 py-8 md:p-0 md:py-4 pb-32 md:pb-12">
          <button 
            onClick={() => setSelectedItem(null)}
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition"
          >
            <ArrowLeft className="size-4" /> Kembali ke Menu
          </button>

          <div>
            <div className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
              {selectedItem.category}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">{selectedItem.name}</h1>
            <div className="mt-4 text-2xl md:text-3xl font-bold text-accent">{formatRupiah(totalPrice)}</div>
          </div>
          
          {selectedItem.options && selectedItem.options.length > 0 && (
            <div className="mt-8 border-t border-border pt-8 flex-1">
              <h3 className="font-display text-xl font-semibold mb-4">Pilihan Kustomisasi</h3>
              <div className="space-y-6">
                {selectedItem.options.map((opt: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold">{opt.name}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {opt.type === "wajib" ? "Wajib" : "Opsional"}
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {opt.choices.map((choice: any, j: number) => {
                        const isSelected = selections[opt.name]?.includes(choice.name);
                        return (
                          <label key={j} onClick={() => handleSelect(opt.name, opt.type, choice.name)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`grid size-5 shrink-0 place-items-center border ${opt.type === "wajib" ? 'rounded-full' : 'rounded-md'} ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>
                                {isSelected && (opt.type === "wajib" ? <div className="size-2 rounded-full bg-current" /> : <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {choice.icon && renderIcon(choice.icon, "size-4 text-muted-foreground")}
                                <span className="font-medium text-sm">{choice.name}</span>
                              </div>
                            </div>
                            {choice.price_diff > 0 && (
                              <span className="text-xs font-bold text-accent">+{formatRupiah(choice.price_diff)}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 md:mt-12 border-t border-border pt-8 md:pt-12 flex-1">
            <h3 className="font-display text-xl font-semibold mb-4">Deskripsi</h3>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">{selectedItem.description}</p>
          </div>
          
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur md:static md:border-none md:bg-transparent md:p-0 md:pt-12">
            <div className="mx-auto max-w-3xl md:max-w-none">
              <button
                onClick={() => {
                  let noteParts: string[] = [];
                  if (selectedItem.options) {
                    selectedItem.options.forEach((opt: any) => {
                      const selected = selections[opt.name] || [];
                      if (selected.length > 0) {
                        noteParts.push(`${opt.name}: ${selected.join(", ")}`);
                      }
                    });
                  }
                  const customNote = noteParts.join(" | ");
                  
                  // Encode options into the ID to allow multiple instances of same item with diff options
                  const hash = customNote ? btoa(customNote).replace(/=/g, '').slice(0, 10) : ""; 
                  const cartItemId = customNote ? `${selectedItem.id}_${hash}` : selectedItem.id;
                  
                  onAdd({
                    ...selectedItem,
                    id: cartItemId,
                    menuItemId: selectedItem.id,
                    price: totalPrice,
                    note: customNote || undefined
                  });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base md:text-lg font-bold text-primary-foreground shadow-warm hover:opacity-90 transition hover:-translate-y-0.5"
              >
                <Plus className="size-5" /> Tambah ke Pesanan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
