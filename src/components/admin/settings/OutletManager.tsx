import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function OutletManager() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    access_pin: "",
    latitude: "0",
    longitude: "0",
    is_active: true
  });

  const fetchBranches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("created_at", { ascending: true });
      
    if (error) {
      toast.error("Gagal mengambil data outlet", { description: error.message });
    } else {
      setBranches(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Anda yakin ingin menghapus outlet ${name}?`)) return;
    
    // Warn about possible constraint failure
    const confirmDelete = window.confirm(
      "PERHATIAN: Jika outlet ini sudah pernah menerima pesanan, proses penghapusan mungkin akan ditolak oleh sistem untuk melindungi data laporan keuangan.\n\nApakah Anda tetap ingin melanjutkan?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) {
        if (error.code === '23503') { // foreign_key_violation
          toast.error(`Gagal menghapus outlet ${name}`, { 
            description: "Outlet ini sudah memiliki riwayat transaksi/pesanan. Jika Anda ingin menutupnya, pertimbangkan untuk mengubah status menjadi Tidak Aktif saja."
          });
        } else {
          toast.error("Gagal menghapus outlet", { description: error.message });
        }
      } else {
        toast.success("Outlet berhasil dihapus");
        fetchBranches();
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan", { description: e.message });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Nama dan Slug outlet wajib diisi!");
      return;
    }

    // validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error("Slug hanya boleh berisi huruf kecil, angka, dan strip (-)");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("branches").insert({
        name: formData.name,
        slug: formData.slug,
        address: formData.address || null,
        access_pin: formData.access_pin || "123456", // default pin if empty
        is_active: formData.is_active,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0
      });

      if (error) {
        toast.error("Gagal menambah outlet", { description: error.message });
      } else {
        toast.success("Outlet berhasil ditambahkan");
        setIsOpen(false);
        setFormData({ name: "", slug: "", address: "", access_pin: "", latitude: "0", longitude: "0", is_active: true });
        fetchBranches();
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-display text-primary">Daftar Outlet</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition">
              <Plus className="size-4" /> Tambah Outlet
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Outlet Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Nama Outlet *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl border border-border p-2.5 text-sm" 
                  placeholder="Contoh: LNR Sudirman" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Slug (ID Unik URL) *</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  className="w-full rounded-xl border border-border p-2.5 text-sm font-mono" 
                  placeholder="Contoh: sudirman" 
                  required
                />
                <p className="text-[10px] text-muted-foreground">Hanya huruf kecil, angka, dan -. Akan digunakan di URL.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Alamat Outlet</label>
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-xl border border-border p-2.5 text-sm resize-none h-20" 
                  placeholder="Alamat lengkap..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.latitude} 
                    onChange={e => setFormData({...formData, latitude: e.target.value})}
                    className="w-full rounded-xl border border-border p-2.5 text-sm" 
                    placeholder="-6.200000" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.longitude} 
                    onChange={e => setFormData({...formData, longitude: e.target.value})}
                    className="w-full rounded-xl border border-border p-2.5 text-sm" 
                    placeholder="106.816666" 
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground -mt-3">Buka Google Maps, klik kanan pada lokasi, dan salin koordinatnya (contoh: -6.2, 106.8).</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">PIN Login Dashboard Outlet *</label>
                <input 
                  type="text" 
                  value={formData.access_pin} 
                  onChange={e => setFormData({...formData, access_pin: e.target.value.replace(/[^0-9]/g, '')})}
                  className="w-full rounded-xl border border-border p-2.5 text-sm" 
                  placeholder="Contoh: 123456" 
                  required
                  maxLength={6}
                />
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="size-4 rounded accent-primary" 
                />
                <label htmlFor="isActive" className="text-sm font-bold text-foreground cursor-pointer">
                  Outlet Aktif
                </label>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Simpan Outlet'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className={`bg-background border rounded-2xl p-5 shadow-sm transition group relative ${branch.is_active ? 'border-border' : 'border-dashed border-muted-foreground/30 opacity-70'}`}>
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Store className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{branch.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground">slug: {branch.slug}</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(branch.id, branch.name)}
                className="p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                title="Hapus Outlet"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            
            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-4 mb-4">
              <MapPin className="size-4 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{branch.address || <i className="opacity-50">Belum ada alamat</i>}</span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${branch.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary text-muted-foreground'}`}>
                {branch.is_active ? 'Buka / Aktif' : 'Tutup'}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                PIN: {branch.access_pin || 'Belum diset'}
              </span>
            </div>
            
          </div>
        ))}

        {branches.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <Store className="size-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Belum ada outlet terdaftar</p>
          </div>
        )}
      </div>
    </div>
  );
}
