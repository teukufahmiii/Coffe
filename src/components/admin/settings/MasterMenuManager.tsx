import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { MenuItem, CATS, PRESET_OPTIONS } from "@/types/menu";

function MasterMenuManager() {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setItems(null);
    const { data: bData } = await supabase.from("branches").select("*").order("name");
    if (bData) setBranches(bData);

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("name");
    
    if (error) toast.error(error.message);
    else setItems(data as MenuItem[]);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing.category || editing.price == null) {
      toast.error("Nama, kategori, dan harga wajib diisi");
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name,
      category: editing.category,
      price: Number(editing.price),
      description: editing.description ?? "",
      image_url: editing.image_url ?? null,
      options: editing.options ?? null,
      available_branches: editing.available_branches ?? branches.map(b => b.slug),
    };
    const { error } = editing.id
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editing.id ? "Menu diperbarui" : "Menu ditambahkan");
      setEditing(null);
      load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus menu ini secara global? Ini akan menghapusnya dari semua cabang.")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Menu dihapus secara global"); load(); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from("menu-images").upload(fileName, file);
    if (error) toast.error(error.message);
    else {
      const { data: { publicUrl } } = supabase.storage.from("menu-images").getPublicUrl(fileName);
      setEditing(prev => prev ? { ...prev, image_url: publicUrl } : prev);
      toast.success("Gambar berhasil diunggah");
    }
    setUploading(false);
  };

  const togglePreset = (presetName: string) => {
    if (!editing) return;
    const currentOpts = editing.options || [];
    if (currentOpts.find(o => o.name === presetName)) {
      setEditing({ ...editing, options: currentOpts.filter(o => o.name !== presetName) });
    } else {
      const preset = PRESET_OPTIONS.find(p => p.name === presetName);
      if (preset) {
        setEditing({ ...editing, options: [...currentOpts, JSON.parse(JSON.stringify(preset))] });
      }
    }
  };

  const updatePresetPrice = (presetName: string, choiceIndex: number, newPrice: number) => {
    if (!editing) return;
    const currentOpts = [...(editing.options || [])];
    const grpIndex = currentOpts.findIndex(o => o.name === presetName);
    if (grpIndex !== -1) {
      currentOpts[grpIndex].choices[choiceIndex].price_diff = newPrice;
      setEditing({ ...editing, options: currentOpts });
    }
  };

  const togglePresetChoice = (presetName: string, choiceTemplate: any) => {
    if (!editing) return;
    const currentOpts = [...(editing.options || [])];
    const grpIndex = currentOpts.findIndex(o => o.name === presetName);
    if (grpIndex === -1) return;
    
    const grp = currentOpts[grpIndex];
    const choiceIndex = grp.choices.findIndex(c => c.name === choiceTemplate.name);
    
    if (choiceIndex !== -1) {
       grp.choices.splice(choiceIndex, 1);
    } else {
       grp.choices.push(JSON.parse(JSON.stringify(choiceTemplate)));
    }
    setEditing({ ...editing, options: currentOpts });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Menu yang ditambahkan di sini akan tersedia di semua cabang secara default.</p>
        <button onClick={() => setEditing({ available_branches: branches.map(b => b.slug), category: "coffee", price: 0, description: "", name: "", options: [], image_url: null })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Tambah Menu Global
        </button>
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
                  {list.map((it, idx) => (
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
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</div>
                        {it.options && it.options.length > 0 && (
                          <div className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {it.options.length} Grup Opsi
                          </div>
                        )}
                      </div>
                      <div className="font-display font-bold text-accent">{formatRupiah(it.price)}</div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(it)} className="grid size-8 place-items-center rounded-lg bg-secondary hover:bg-accent/30">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => remove(it.id)} className="grid size-8 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-background shadow-warm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-xl font-bold">{editing.id ? "Edit Menu Global" : "Tambah Menu Global"}</h2>
              <button onClick={() => setEditing(null)} className="grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/80"><X className="size-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* GAMBAR */}
              <div className="flex items-start gap-5">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <Upload className="size-6 opacity-50" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-sm font-semibold">Gambar Menu</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-secondary/80">
                    <Upload className="size-4" /> Upload Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">Format JPG, PNG. Ukuran ideal 1:1.</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* INFO DASAR */}
              <div className="space-y-4">
                <Field label="Nama Menu">
                  <input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kategori">
                    <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as MenuItem["category"] })} className="input">
                      {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Harga Dasar (Rp)">
                    <input type="number" min={0} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="input" />
                  </Field>
                </div>
                <Field label="Deskripsi">
                  <textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input resize-none" />
                </Field>
              </div>

              <div className="h-px bg-border" />

              {/* KETERSEDIAAN CABANG */}
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">Ketersediaan Cabang</h3>
                  <p className="text-xs text-muted-foreground">Centang cabang mana saja menu ini tersedia.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {branches.map(b => {
                    const isAvail = (editing.available_branches || []).includes(b.slug);
                    return (
                      <label key={b.slug} className={`flex cursor-pointer items-center gap-3 p-3 rounded-xl border transition-all ${isAvail ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={isAvail}
                          onChange={(e) => {
                            const current = editing.available_branches || [];
                            const next = e.target.checked 
                              ? [...current, b.slug] 
                              : current.filter(x => x !== b.slug);
                            setEditing({ ...editing, available_branches: next });
                          }}
                        />
                        <span className="text-sm font-medium">{b.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* OPSI KUSTOMISASI SIMPLE */}
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">Opsi Kustomisasi</h3>
                  <p className="text-xs text-muted-foreground">Centang fitur yang ingin ditambahkan pada menu ini. Anda bisa mengubah harga tambahannya jika perlu.</p>
                </div>

                <div className="space-y-3">
                  {PRESET_OPTIONS.map((preset) => {
                    const activeGroup = (editing.options || []).find((o: any) => o.name === preset.name);
                    const isActive = !!activeGroup;

                    return (
                      <div key={preset.name} className={`rounded-xl border transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <label className="flex cursor-pointer items-center gap-3 p-4">
                          <input 
                            type="checkbox" 
                            className="size-4 accent-primary" 
                            checked={isActive} 
                            onChange={() => togglePreset(preset.name)} 
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.type === "wajib" ? "Wajib Pilih 1" : "Opsional (Bisa banyak / Maks 1)"}</div>
                          </div>
                        </label>
                        
                        {isActive && activeGroup && (
                          <div className="border-t border-primary/20 bg-background/50 p-4 space-y-3">
                            {preset.choices.map((choice) => {
                              const activeChoiceIndex = activeGroup.choices.findIndex((c: any) => c.name === choice.name);
                              const isChoiceActive = activeChoiceIndex !== -1;
                              const activeChoice = isChoiceActive ? activeGroup.choices[activeChoiceIndex] : choice;

                              return (
                                <div key={choice.name} className={`flex items-center justify-between gap-4 transition-all ${!isChoiceActive ? 'opacity-40 grayscale' : ''}`}>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      className="size-4 accent-primary" 
                                      checked={isChoiceActive}
                                      onChange={() => togglePresetChoice(preset.name, choice)}
                                    />
                                    <span className="text-sm font-medium">{choice.name}</span>
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">+Rp</span>
                                    <input 
                                      type="number"
                                      value={activeChoice.price_diff}
                                      onChange={(e) => isChoiceActive && updatePresetPrice(preset.name, activeChoiceIndex, Number(e.target.value))}
                                      disabled={!isChoiceActive}
                                      className="w-24 rounded-lg border border-border p-2 text-sm outline-none focus:border-primary bg-background disabled:bg-secondary/50"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-5">
              <button onClick={save} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Simpan Menu Global
              </button>
            </div>
          </div>
          <style>{`.input{width:100%;border:1px solid var(--border);border-radius:.75rem;padding:.65rem .9rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--accent)}`}</style>
        </div>
      )}
    </div>
  );
}

