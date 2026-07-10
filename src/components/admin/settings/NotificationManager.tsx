import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Loader2, BellRing, Save, Trash2, CheckCircle2, Plus, Image as ImageIcon } from "lucide-react";

type AppNotification = Database["public"]["Tables"]["notifications"]["Row"];

function NotificationManager() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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



export { NotificationManager };
