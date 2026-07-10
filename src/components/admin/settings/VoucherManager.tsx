import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Upload, Save, Ticket, Star } from "lucide-react";
import { formatRupiah } from "@/lib/format";

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
  const [pointsRequired, setPointsRequired] = useState("0");
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
        points_required: Number(pointsRequired),
        is_active: true,
        is_visual: true,
        is_permanent: false
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
      setPointsRequired("0");
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
            <div>
              <label className="block text-sm font-medium mb-1">Syarat Poin LNR (Opsional)</label>
              <input
                type="number"
                value={pointsRequired}
                onChange={e => setPointsRequired(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                placeholder="Misal: 20 (Biarkan 0 jika bukan voucher poin)"
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
                      <span>â€¢</span>
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
                  {!voucher.is_permanent && (
                    <button
                      onClick={() => handleDelete(voucher.id)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5 inline mr-0.5" /> Hapus
                    </button>
                  )}
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
                    <span>â€¢</span>
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

          {/* VOUCHER POIN 10% */}
          <div className="flex items-start gap-4 bg-gradient-to-r from-white to-[#F9F6F0] p-5 rounded-2xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">Sistem</div>
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Star className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-primary tracking-wide">
                    Voucher Poin (20 Poin)
                  </h3>
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">PTS-10</span>
                    <span>â€¢</span>
                    <span>Diskon: 10%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                    <span>Min Belanja: Rp 0</span>
                    <span>Berlaku s/d: Selamanya</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2.5 py-1.5 rounded-lg">
                  Bisa ditukar dengan 20 Poin LNR. Tidak bisa dihapus.
                </span>
              </div>
            </div>
          </div>

          {/* VOUCHER POIN 20% */}
          <div className="flex items-start gap-4 bg-gradient-to-r from-white to-[#F9F6F0] p-5 rounded-2xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">Sistem</div>
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Star className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-primary tracking-wide">
                    Voucher Poin (30 Poin)
                  </h3>
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">PTS-20</span>
                    <span>â€¢</span>
                    <span>Diskon: 20%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                    <span>Min Belanja: Rp 0</span>
                    <span>Berlaku s/d: Selamanya</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2.5 py-1.5 rounded-lg">
                  Bisa ditukar dengan 30 Poin LNR. Tidak bisa dihapus.
                </span>
              </div>
            </div>
          </div>

          {/* VOUCHER POIN 35% */}
          <div className="flex items-start gap-4 bg-gradient-to-r from-white to-[#F9F6F0] p-5 rounded-2xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">Sistem</div>
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Star className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-primary tracking-wide">
                    Voucher Poin (50 Poin)
                  </h3>
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">PTS-35</span>
                    <span>â€¢</span>
                    <span>Diskon: 35%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                    <span>Min Belanja: Rp 0</span>
                    <span>Berlaku s/d: Selamanya</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2.5 py-1.5 rounded-lg">
                  Bisa ditukar dengan 50 Poin LNR. Tidak bisa dihapus.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


type Voucher = {
  id: string;
  code: string;
  title: string | null;
  valid_until: string | null;
  discount_type: "percentage" | "fixed";
  discount_amount: number;
  min_order_amount: number;
  points_required: number;
  is_active: boolean;
  is_visual: boolean;
  is_permanent: boolean;
  created_at: string;
};


export { VoucherManager };
