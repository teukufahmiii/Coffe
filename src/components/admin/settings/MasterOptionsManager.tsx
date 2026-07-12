import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Save, X, GripVertical } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { CUSTOMIZATION_ICONS, renderIcon } from "@/lib/icons";

export function MasterOptionsManager() {
  const [options, setOptions] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [showIconPickerFor, setShowIconPickerFor] = useState<number | null>(null); // Index of choice being edited for icon

  const load = async () => {
    setOptions(null);
    const { data, error } = await supabase
      .from("customization_options")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error(error.message);
    } else {
      setOptions(data || []);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing.type) {
      toast.error("Nama grup opsi dan tipe wajib diisi");
      return;
    }
    
    // Ensure choices are properly formatted
    const cleanChoices = (editing.choices || []).filter((c: any) => c.name.trim() !== "").map((c: any) => ({
      name: c.name,
      price_diff: Number(c.price_diff || 0),
      icon: c.icon || undefined
    }));

    setSaving(true);
    const payload = {
      name: editing.name,
      type: editing.type,
      choices: cleanChoices,
    };
    
    const { error } = editing.id
      ? await supabase.from("customization_options").update(payload).eq("id", editing.id)
      : await supabase.from("customization_options").insert(payload);
      
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing.id ? "Opsi diperbarui" : "Opsi ditambahkan");
      setEditing(null);
      load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus opsi kustomisasi ini? Menu yang sudah menggunakannya mungkin akan terpengaruh.")) return;
    const { error } = await supabase.from("customization_options").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Opsi dihapus"); load(); }
  };

  const addChoice = () => {
    setEditing({
      ...editing,
      choices: [...(editing.choices || []), { name: "", price_diff: 0, icon: "" }]
    });
  };

  const updateChoice = (index: number, field: string, value: any) => {
    const newChoices = [...(editing.choices || [])];
    newChoices[index][field] = value;
    setEditing({ ...editing, choices: newChoices });
  };

  const removeChoice = (index: number) => {
    const newChoices = [...(editing.choices || [])];
    newChoices.splice(index, 1);
    setEditing({ ...editing, choices: newChoices });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola opsi kustomisasi (seperti ukuran, es, gula) yang nantinya bisa dipilih saat membuat menu.</p>
        <button onClick={() => setEditing({ name: "", type: "wajib", choices: [] })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Tambah Opsi
        </button>
      </div>

      {options === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : options.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Belum ada master opsi kustomisasi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => (
            <div key={opt.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{opt.name}</h3>
                  <span className="inline-block mt-1 rounded bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {opt.type === "wajib" ? "Wajib Pilih 1" : "Opsional"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(opt)} className="grid size-8 place-items-center rounded-lg bg-secondary hover:bg-accent/30 text-foreground">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => remove(opt.id)} className="grid size-8 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-3">
                {opt.choices?.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground bg-secondary/50 p-1.5 rounded-md">
                        {renderIcon(c.icon, "size-3.5")}
                        {!c.icon && <span className="size-3.5 inline-block" />}
                      </span>
                      <span>{c.name}</span>
                    </div>
                    <span className="font-medium text-accent">+{formatRupiah(c.price_diff)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDITOR */}
      {editing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-background shadow-warm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-xl font-bold">{editing.id ? "Edit Opsi" : "Tambah Opsi Baru"}</h2>
              <button onClick={() => setEditing(null)} className="grid size-8 place-items-center rounded-full bg-secondary hover:bg-secondary/80"><X className="size-4" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Nama Grup Opsi</label>
                <input 
                  type="text" 
                  placeholder="Cth: Ukuran Cup, Gula, Topping"
                  value={editing.name} 
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} 
                  className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary" 
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Tipe Pilihan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setEditing({ ...editing, type: "wajib" })}
                    className={`rounded-xl border p-3 text-sm font-medium transition ${editing.type === "wajib" ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'}`}
                  >
                    Wajib (Pilih 1)
                  </button>
                  <button 
                    onClick={() => setEditing({ ...editing, type: "opsional" })}
                    className={`rounded-xl border p-3 text-sm font-medium transition ${editing.type === "opsional" ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'}`}
                  >
                    Opsional (Bisa Pilih)
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold">Daftar Pilihan (Choices)</label>
                  <button onClick={addChoice} className="text-xs font-bold text-primary hover:underline">+ Tambah</button>
                </div>
                
                <div className="space-y-3">
                  {editing.choices?.map((c: any, index: number) => (
                    <div key={index} className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/20 p-3">
                      <div className="flex items-center gap-2">
                        {/* Icon Picker Button */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowIconPickerFor(showIconPickerFor === index ? null : index)}
                            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background hover:bg-secondary transition"
                            title="Pilih Ikon"
                          >
                            {c.icon ? renderIcon(c.icon, "size-5 text-primary") : <Plus className="size-4 text-muted-foreground" />}
                          </button>
                          
                          {/* Icon Picker Dropdown */}
                          {showIconPickerFor === index && (
                            <div className="absolute left-0 top-12 z-10 w-48 rounded-xl border border-border bg-background p-2 shadow-lg grid grid-cols-5 gap-1">
                              {Object.keys(CUSTOMIZATION_ICONS).map(iconName => (
                                <button
                                  key={iconName}
                                  onClick={() => { updateChoice(index, "icon", iconName); setShowIconPickerFor(null); }}
                                  className={`grid place-items-center p-2 rounded-lg hover:bg-primary/10 ${c.icon === iconName ? 'bg-primary/20 text-primary' : 'text-foreground'}`}
                                  title={iconName}
                                >
                                  {renderIcon(iconName, "size-4")}
                                </button>
                              ))}
                              <button
                                onClick={() => { updateChoice(index, "icon", ""); setShowIconPickerFor(null); }}
                                className="grid place-items-center p-2 rounded-lg hover:bg-destructive/10 text-destructive col-span-5 text-xs font-semibold mt-1"
                              >
                                Hapus Ikon
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <input 
                          type="text" 
                          placeholder="Nama Pilihan (Cth: Large)"
                          value={c.name} 
                          onChange={(e) => updateChoice(index, "name", e.target.value)}
                          className="flex-1 rounded-lg border border-border p-2.5 text-sm outline-none focus:border-primary"
                        />
                        <button onClick={() => removeChoice(index)} className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 pl-[48px]">
                        <span className="text-xs font-semibold text-muted-foreground">+Rp</span>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={c.price_diff} 
                          onChange={(e) => updateChoice(index, "price_diff", e.target.value)}
                          className="w-full rounded-lg border border-border p-2 text-sm outline-none focus:border-primary bg-background"
                        />
                      </div>
                    </div>
                  ))}
                  {(!editing.choices || editing.choices.length === 0) && (
                    <div className="text-center text-xs text-muted-foreground py-4">Belum ada pilihan. Klik + Tambah.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-5">
              <button onClick={save} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Simpan Opsi Kustomisasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
