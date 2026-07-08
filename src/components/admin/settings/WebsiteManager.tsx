import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Globe, Image as ImageIcon, Save, Trash2 } from "lucide-react";

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
  points_required: number;
  is_permanent: boolean;
  created_at: string;
};

