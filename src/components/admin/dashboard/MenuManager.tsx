import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { MenuItem, CATS } from "@/types/menu";

export function MenuManager({ branch }: { branch: string }) {
  const [items, setItems] = useState<MenuItem[] | null>(null);

  const load = async () => {
    setItems(null);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("name");
    
    if (error) toast.error(error.message);
    else setItems(data as MenuItem[]);
  };

  useEffect(() => { load(); }, [branch]);

  const toggleAvail = async (it: MenuItem) => {
    const branches = it.available_branches || [];
    const isCurrentlyAvail = branches.includes(branch);
    
    let newBranches;
    if (isCurrentlyAvail) {
      newBranches = branches.filter(b => b !== branch);
    } else {
      newBranches = [...branches, branch];
    }
    
    const { error } = await supabase.from("menu_items").update({ available_branches: newBranches }).eq("id", it.id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div>
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong className="block mb-1">Informasi:</strong>
        Di sini Anda hanya dapat mengatur ketersediaan (Tersedia/Habis) untuk cabang terpilih. Untuk menambah, mengedit, atau menghapus menu, silakan gunakan fitur <b>Master Admin</b>.
      </div>

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {CATS.map((c) => {
            const list = items.filter((i) => i.category === c);
            return (
              <section key={c}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{c}</h2>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {list.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Belum ada menu di kategori ini.</div>}
                  {list.map((it, idx) => {
                    const isAvailable = (it.available_branches || []).includes(branch);
                    
                    return (
                      <div key={it.id} className={`flex flex-wrap items-center gap-4 p-4 ${idx > 0 ? "border-t border-border" : ""}`}>
                        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-accent/15">
                          <img 
                            src={it.image_url || `/images/${it.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `/images/${it.category}.png`; }}
                            alt={it.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{it.name}</span>
                            {!isAvailable && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">Habis</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</div>
                        </div>
                        <div className="font-display font-bold text-accent pr-4">{formatRupiah(it.price)}</div>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold rounded-lg bg-secondary px-3 py-2 hover:bg-accent/10 transition">
                          <input type="checkbox" checked={isAvailable} onChange={() => toggleAvail(it)} className="accent-[color:var(--accent)] size-4" />
                          {isAvailable ? 'Tersedia' : 'Habis'}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
