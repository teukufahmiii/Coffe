import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { AdminShell } from "@/components/admin-shell";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, KeyRound, Coffee, Plus, Pencil, Trash2, X, Upload, Save, ShieldCheck, Globe, Image as ImageIcon, Ticket, BellRing, QrCode, Printer, Users, Eye, EyeOff } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { MenuItem, CATS, PRESET_OPTIONS } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"website" | "menu" | "users" | "security" | "vouchers" | "notifications" | "qr">("website");
  
  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Master Admin</h1>
        <p className="text-sm text-muted-foreground">Kelola website, menu global, dan keamanan tingkat lanjut</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("website")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "website" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Globe className="size-4" /> Kelola Banner
        </button>
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "vouchers" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Ticket className="size-4" /> Voucher
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "notifications" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <BellRing className="size-4" /> Notifikasi
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "qr" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <QrCode className="size-4" /> QR Meja
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "menu" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Coffee className="size-4" /> Kelola Menu Global
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Users className="size-4" /> Pengguna
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "security" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <ShieldCheck className="size-4" /> Keamanan Akun
        </button>
      </div>

      {activeTab === "website" && <WebsiteManager />}
      {activeTab === "menu" && <MasterMenuManager />}
      {activeTab === "users" && <UserManager />}
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "vouchers" && <VoucherManager />}
      {activeTab === "notifications" && <NotificationManager />}
      {activeTab === "qr" && <QrManager />}
    </AdminShell>
  );
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Masukkan password saat ini");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setSubmitting(true);
    
    // Verifikasi password saat ini
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Password saat ini salah");
        setSubmitting(false);
        return;
      }
    }

    // Update ke password baru
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message || "Gagal mengubah password");
    } else {
      toast.success("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={handleUpdatePassword} className="bg-white p-6 rounded-2xl border-2 border-black/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <KeyRound className="size-5" />
          </div>
          <h2 className="font-display text-lg font-bold text-primary">Ubah Password</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-primary transition-colors"
              placeholder="Masukkan password lama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-primary transition-colors"
              placeholder="Minimal 6 karakter"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-primary transition-colors"
              placeholder="Ketik ulang password baru"
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan Password Baru"}
          </button>
        </div>
      </form>
    </div>
  );
}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function WebsiteManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadBanners = async () => {
    const { data, error } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    if (error) {
      toast.error("Gagal memuat banner");
    } else {
      setBanners(data || []);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
    
    const { error: uploadError } = await supabase.storage.from("banners").upload(fileName, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(fileName);
    
    const { error: dbError } = await supabase.from("banners").insert({ image_url: publicUrl });
    if (dbError) {
      toast.error(dbError.message);
    } else {
      toast.success("Banner berhasil diunggah!");
      loadBanners();
    }
    setUploading(false);
  };

  const removeBanner = async (id: string, url: string) => {
    if (!confirm("Hapus banner ini?")) return;
    
    const fileName = url.split('/').pop();
    if (fileName) {
      await supabase.storage.from("banners").remove([fileName]);
    }

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Banner dihapus");
      loadBanners();
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Kelola Banner Promo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Banner ini akan tampil secara otomatis sebagai slider (korsel) di halaman beranda.</p>
          </div>
          
          <div className="shrink-0">
            <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Unggah Banner
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>Rekomendasi Wajib:</strong> Gunakan desain banner dengan rasio <strong>16:9</strong> atau <strong>2:1</strong>. (Contoh ukuran: <strong>1200x600 px</strong> atau <strong>1080x540 px</strong>). Format yang didukung: JPG, PNG.
        </div>

        {banners.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
            <ImageIcon className="mb-2 size-8 opacity-20" />
            <p>Belum ada banner yang diunggah.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {banners.map((b) => (
              <div key={b.id} className="group relative overflow-hidden rounded-xl border border-border bg-secondary shadow-sm">
                <div className="aspect-[2/1] w-full">
                  <img src={b.image_url} alt="Banner Promo" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={() => removeBanner(b.id, b.image_url)}
                    className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-105"
                  >
                    <Trash2 className="size-4" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- NEW COMPONENTS ---

type Voucher = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_amount: number;
  min_order_amount: number;
  title: string | null;
  valid_until: string | null;
  is_active: boolean;
  is_visual: boolean;
  created_at: string;
};

function VoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat voucher");
    } else {
      setVouchers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("vouchers")
      .update({ is_active: !currentStatus })
      .eq("id", id);
      
    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      setVouchers(vouchers.map(v => v.id === id ? { ...v, is_active: !currentStatus } : v));
      toast.success(currentStatus ? "Voucher dinonaktifkan" : "Voucher diaktifkan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus voucher ini?")) return;

    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus voucher");
    } else {
      setVouchers(vouchers.filter(v => v.id !== id));
      toast.success("Voucher dihapus");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountAmount) {
      toast.error("Nominal diskon harus diisi");
      return;
    }

    setSubmitting(true);

    const generatedCode = `LNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { error } = await supabase.from("vouchers").insert([
      { 
        code: generatedCode, 
        title: title || null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        discount_type: discountType, 
        discount_amount: Number(discountAmount),
        min_order_amount: Number(minOrderAmount),
        is_active: true,
        is_visual: true
      }
    ]);

    if (error) {
      if (error.code === '23505') {
        toast.error("Kode voucher sudah ada!");
      } else {
        toast.error("Gagal membuat voucher");
      }
    } else {
      toast.success("Voucher berhasil dibuat");
      setShowForm(false);
      setTitle("");
      setValidUntil("");
      setDiscountAmount("");
      setMinOrderAmount("0");
      fetchVouchers();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Kelola Voucher</h1>
          <p className="text-sm text-muted-foreground">Buat kode diskon untuk pelanggan.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? "Batal" : <><Plus className="size-4" /> Buat Baru</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-2xl border-2 border-black/10 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Buat Voucher Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul Promo (Opsional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                placeholder="Misal: Extra Time Booster! Diskon 10%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Berlaku Hingga</label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Diskon</label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nilai Diskon</label>
              <input
                type="number"
                value={discountAmount}
                onChange={e => setDiscountAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                placeholder={discountType === "percentage" ? "Misal: 10 (untuk 10%)" : "Misal: 20000"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimal Belanja (Rp)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={e => setMinOrderAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                placeholder="Opsional, default 0"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full md:w-auto md:px-8 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground disabled:opacity-50"
          >
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan Voucher"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 bg-white rounded-2xl border border-dashed border-border">
          Belum ada voucher.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className={`flex items-start gap-4 bg-white p-5 rounded-2xl border-2 border-black/10 shadow-sm transition-all ${!voucher.is_active && 'opacity-60 grayscale'}`}>
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Ticket className="size-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-primary tracking-wide">
                      {voucher.title ? voucher.title : voucher.code}
                    </h3>
                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                      <span className="font-bold text-primary">{voucher.code}</span>
                      <span>•</span>
                      <span>Diskon: {voucher.discount_type === 'percentage' ? `${voucher.discount_amount}%` : `Rp ${voucher.discount_amount.toLocaleString('id-ID')}`}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                      <span>Min: Rp {voucher.min_order_amount.toLocaleString('id-ID')}</span>
                      {voucher.valid_until && (
                        <span>Berlaku s/d: {new Date(voucher.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${voucher.is_active ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                      {voucher.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleToggleActive(voucher.id, voucher.is_active)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border hover:bg-accent/10"
                  >
                    {voucher.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => handleDelete(voucher.id)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5 inline mr-0.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VOUCHER KHUSUS */}
      <div className="mt-12 mb-8">
        <h2 className="text-xl font-bold mb-4 font-display text-primary border-b border-border pb-2">Voucher Khusus (Otomatis)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 bg-gradient-to-r from-white to-[#F9F6F0] p-5 rounded-2xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">Sistem</div>
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Ticket className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-primary tracking-wide">
                    Voucher Pengguna Baru
                  </h3>
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">NEWUSER15</span>
                    <span>•</span>
                    <span>Diskon: 15%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                    <span>Min Belanja: Rp 0</span>
                    <span>Berlaku s/d: Selamanya</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2.5 py-1.5 rounded-lg">
                  Otomatis berlaku untuk user baru. Tidak bisa dihapus.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


type Notification = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat notifikasi");
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_active: !currentStatus })
      .eq("id", id);
      
    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_active: !currentStatus } : n));
      toast.success(currentStatus ? "Notifikasi disembunyikan" : "Notifikasi diaktifkan");
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm("Hapus notifikasi ini?")) return;

    if (imageUrl) {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from("notifications").remove([fileName]);
      }
    }

    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus notifikasi");
    } else {
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notifikasi dihapus");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Judul dan isi harus diisi");
      return;
    }

    setSubmitting(true);
    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("notifications")
        .upload(fileName, imageFile);

      if (uploadError) {
        toast.error("Gagal mengunggah gambar");
        setSubmitting(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from("notifications")
        .getPublicUrl(fileName);
        
      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("notifications").insert([
      { title, content, image_url: imageUrl, is_active: true }
    ]);

    if (error) {
      toast.error("Gagal membuat notifikasi");
    } else {
      toast.success("Notifikasi berhasil dibuat");
      setShowForm(false);
      setTitle("");
      setContent("");
      setImageFile(null);
      fetchNotifications();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Kelola Notifikasi</h1>
          <p className="text-sm text-muted-foreground">Buat pengumuman atau promo untuk pelanggan.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? "Batal" : <><Plus className="size-4" /> Buat Baru</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-2xl border-2 border-black/10 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Buat Notifikasi Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                placeholder="Misal: Promo Akhir Tahun"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Isi Pengumuman</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                placeholder="Tulis detail promo atau pengumuman di sini..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gambar / Desain (Opsional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-accent/5 px-4 py-3 text-sm hover:bg-accent/10"
                >
                  <ImageIcon className="size-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {imageFile ? imageFile.name : "Pilih Gambar (JPG/PNG)"}
                  </span>
                </label>
                {imageFile && (
                  <button type="button" onClick={() => setImageFile(null)} className="text-sm text-destructive font-semibold">
                    Hapus
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan Notifikasi"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 bg-white rounded-2xl border border-dashed border-border">
          Belum ada notifikasi.
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border-2 border-black/10 shadow-sm transition-all ${!notif.is_active && 'opacity-60'}`}>
              {notif.image_url && (
                <div className="shrink-0">
                  <img src={notif.image_url} alt="Notifikasi" className="w-full md:w-32 h-32 object-cover rounded-xl" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{notif.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${notif.is_active ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {notif.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{notif.content}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(notif.id, notif.is_active)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-accent/10"
                  >
                    {notif.is_active ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                  <button
                    onClick={() => handleDelete(notif.id, notif.image_url)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5 inline mr-1" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function QrManager() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = origin; // Arahkan ke beranda website

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3 no-print">
        <div>
          <h1 className="font-display text-3xl font-bold">QR Website LNR</h1>
          <p className="text-sm text-muted-foreground">Satu QR Code untuk diarahkan langsung ke website LNR Coffee.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Printer className="size-4" /> Print QR
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-8 print:py-0">
        <div className="print-grid relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[2.5rem] border-[6px] border-primary bg-card p-10 shadow-2xl print:border-[8px] print:shadow-none">
          {/* Decorative background shapes */}
          <div className="absolute -left-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-12 -right-12 size-48 rounded-full bg-accent/10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              <Coffee className="size-3.5" /> Scan Me
            </div>
            <div className="mb-8 text-center font-display text-4xl font-black tracking-tight text-primary">
              LNR Coffee
            </div>
            
            <div className="rounded-3xl bg-white p-4 shadow-inner ring-4 ring-primary/10">
              <QRCodeSVG 
                value={url} 
                size={220} 
                level="H" 
                fgColor="#5C4033" // Warna coklat tema
                bgColor="#FFFFFF"
              />
            </div>
            
            <div className="mt-8 rounded-full border border-border bg-secondary/80 px-5 py-2 text-center text-sm font-bold tracking-wide text-foreground shadow-sm">
              {url.replace(/^https?:\/\//, '')}
            </div>
            
            <div className="mt-5 text-center text-xs font-semibold text-muted-foreground">
              Pesan kopi favoritmu langsung<br/>dari HP tanpa antri!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data && !error) {
      setUsers(data);
    }
    setLoading(false);
  };

  const togglePinVisibility = (id: string) => {
    setVisiblePins(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredUsers = users.filter((u) => 
    (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (u.phone || "").includes(searchQuery)
  );

  return (
    <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl font-bold">Daftar Pengguna</h2>
          <p className="text-sm text-muted-foreground">Lihat pengguna yang telah mendaftar di LNR Coffee</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <input
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 rounded-xl border-2 border-border/50 bg-[#F9F6F0] px-4 py-2 font-medium outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="p-3 font-bold">Nama</th>
              <th className="p-3 font-bold">Nomor HP</th>
              <th className="p-3 font-bold">PIN</th>
              <th className="p-3 font-bold">Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground font-medium">
                  Belum ada pengguna yang mendaftar atau ditemukan.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-[#F9F6F0]/50 transition-colors">
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm tracking-wider font-bold">
                        {visiblePins[u.id] ? u.pin : "****"}
                      </code>
                      <button 
                        onClick={() => togglePinVisibility(u.id)}
                        className="text-muted-foreground hover:text-black transition-colors"
                        title={visiblePins[u.id] ? "Sembunyikan PIN" : "Tampilkan PIN"}
                      >
                        {visiblePins[u.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
