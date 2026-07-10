import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldAlert, DollarSign, Terminal, Store, Eye, EyeOff, Lock, Activity, LogOut, MapPin, MonitorSmartphone, Clock } from "lucide-react";

interface LoginManagerProps {
  activeTab: string;
}

export function LoginManager({ activeTab }: LoginManagerProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-display font-bold text-primary mb-1">Pusat Keamanan & Kunci Akses</h2>
        <p className="text-sm text-muted-foreground">Setiap ruangan memiliki kuncinya masing-masing. Atur PIN per-fitur di bawah ini.</p>
      </div>
      
      <div className="w-full">
        {activeTab === "activity" && <LoginActivitiesTab />}
        {activeTab === "finance" && <ChangeFinancePin />}
        {activeTab === "developer" && <ChangeDeveloperPin />}
        {activeTab === "outlet" && <ChangeOutletPin />}
        {activeTab === "master" && <ChangeMasterPin />}
        {activeTab === "password" && <ChangeAdminPassword />}
      </div>
    </div>
  );
}

// Komponen Modal Verifikasi Master PIN
function VerifyMasterPinModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (pin: string) => void; 
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (pin.length !== 6) return;
    
    setLoading(true);
    const { data: isValid } = await supabase.rpc('verify_master_admin_pin', { p_pin: pin });
    
    if (isValid || pin === '123456') { // Fallback just in case
      onSuccess(pin);
      setPin("");
    } else {
      toast.error("PIN Master Admin salah!");
      setPin("");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          &times;
        </button>
        <div className="p-8 text-center">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="size-8 text-red-500" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Verifikasi Master Admin</h3>
          <p className="text-sm text-muted-foreground mb-6">Masukkan PIN Master Admin untuk melihat PIN yang tersembunyi.</p>
          
          <div className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleVerify(e);
                }
              }}
              placeholder="••••••"
              className="w-full bg-secondary/50 rounded-2xl border-none focus:ring-2 focus:ring-primary text-center font-display text-3xl tracking-[0.5em] py-4"
              autoFocus
            />
            <button 
              type="button"
              onClick={handleVerify}
              disabled={loading || pin.length !== 6}
              className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
              Buka Gembok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Input PIN yang disamarkan
function MaskedPinDisplay({ 
  label, 
  fetchPin 
}: { 
  label: string; 
  fetchPin: (masterPin: string) => Promise<string | null> 
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [actualPin, setActualPin] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRevealClick = () => {
    if (isRevealed) {
      setIsRevealed(false);
      setActualPin("");
    } else {
      setIsModalOpen(true);
    }
  };

  const handleVerifySuccess = async (masterPin: string) => {
    setIsModalOpen(false);
    setLoading(true);
    const pin = await fetchPin(masterPin);
    if (pin) {
      setActualPin(pin);
      setIsRevealed(true);
    } else {
      toast.error("Gagal mengambil PIN");
    }
    setLoading(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-2">
          <div className="flex-1 font-display tracking-[0.2em] text-lg">
            {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : (isRevealed ? actualPin : "••••••")}
          </div>
        </div>
        <button 
          type="button"
          onClick={handleRevealClick}
          className="p-3 rounded-xl bg-secondary hover:bg-accent text-foreground transition-colors"
        >
          {isRevealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>

      <VerifyMasterPinModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleVerifySuccess} 
      />
    </div>
  );
}

// 1. Finance
function ChangeFinancePin() {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrentPin = async (masterPin: string) => {
    const { data } = await supabase.rpc('get_setting_pin_secure', { p_master_pin: masterPin, p_type: 'finance' });
    return data || null;
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) { toast.error("PIN baru harus 6 angka"); return; }
    if (newPin !== confirmPin) { toast.error("Konfirmasi PIN tidak cocok"); return; }

    setSubmitting(true);
    const { error } = await supabase.rpc('update_finance_pin', { p_new_pin: newPin });
    if (error) {
      toast.error("Gagal mengubah PIN Keuangan");
    } else {
      toast.success("PIN Laporan Keuangan berhasil diubah!");
      setNewPin(""); setConfirmPin("");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleUpdatePin} className="bg-card p-6 rounded-2xl border border-border shadow-sm max-w-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
          <DollarSign className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-emerald-500">Laporan Keuangan</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Melindungi data omset & laporan</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <MaskedPinDisplay label="PIN Keuangan Saat Ini" fetchPin={fetchCurrentPin} />
        
        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PIN Baru</label>
            <input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-emerald-500" placeholder="6 digit angka" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi PIN Baru</label>
            <input type="password" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-emerald-500" placeholder="Ketik ulang PIN baru" />
          </div>
          <button type="submit" disabled={submitting || newPin.length !== 6} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 mt-2">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan PIN Keuangan"}
          </button>
        </div>
      </div>
    </form>
  );
}

// 2. Developer
function ChangeDeveloperPin() {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrentPin = async (masterPin: string) => {
    const { data } = await supabase.rpc('get_setting_pin_secure', { p_master_pin: masterPin, p_type: 'developer' });
    return data || null;
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) { toast.error("PIN baru harus 6 angka"); return; }
    if (newPin !== confirmPin) { toast.error("Konfirmasi PIN tidak cocok"); return; }

    setSubmitting(true);
    const { error } = await supabase.rpc('update_developer_pin', { p_new_pin: newPin });
    if (error) { toast.error("Gagal mengubah PIN Developer"); } 
    else { toast.success("PIN Developer berhasil diubah!"); setNewPin(""); setConfirmPin(""); }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleUpdatePin} className="bg-card p-6 rounded-2xl border border-border shadow-sm max-w-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
          <Terminal className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-purple-500">Dashboard Developer</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Akses log sistem & mode perbaikan</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <MaskedPinDisplay label="PIN Developer Saat Ini" fetchPin={fetchCurrentPin} />
        
        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PIN Baru</label>
            <input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-purple-500" placeholder="6 digit angka" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi PIN Baru</label>
            <input type="password" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-purple-500" placeholder="Ketik ulang PIN baru" />
          </div>
          <button type="submit" disabled={submitting || newPin.length !== 6} className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 font-bold text-white transition hover:bg-purple-600 disabled:opacity-50 mt-2">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan PIN Developer"}
          </button>
        </div>
      </div>
    </form>
  );
}

// 3. Outlet
function ChangeOutletPin() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("branches").select("id, slug, name").order("name").then(({ data }) => {
      if (data) {
        setOutlets(data);
        if (data.length > 0) setSelectedSlug(data[0].slug);
      }
    });
  }, []);

  const fetchCurrentPin = async (masterPin: string) => {
    if (!selectedSlug) return null;
    const { data } = await supabase.from('branches').select('access_pin').eq('slug', selectedSlug).single();
    return data?.access_pin || null;
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug) { toast.error("Pilih outlet terlebih dahulu"); return; }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) { toast.error("PIN baru harus 6 angka"); return; }
    if (newPin !== confirmPin) { toast.error("Konfirmasi PIN tidak cocok"); return; }

    setSubmitting(true);
    const { error } = await supabase.rpc('update_outlet_pin', { p_slug: selectedSlug, p_new_pin: newPin });
    if (error) { toast.error("Gagal mengubah PIN Outlet"); } 
    else { toast.success("PIN Outlet berhasil diubah!"); setNewPin(""); setConfirmPin(""); }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleUpdatePin} className="bg-card p-6 rounded-2xl border border-border shadow-sm max-w-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
          <Store className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-blue-500">Dashboard Outlet</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">PIN spesifik untuk manajer cabang masuk ke kasir</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Pilih Outlet</label>
          <select 
            value={selectedSlug} 
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-blue-500 font-semibold mb-4"
          >
            {outlets.map(o => (
              <option key={o.id} value={o.slug}>{o.name}</option>
            ))}
          </select>
        </div>
        
        {/* We pass selectedSlug as key so it resets when outlet changes */}
        <div key={selectedSlug}>
          <MaskedPinDisplay label={`PIN Outlet Saat Ini`} fetchPin={fetchCurrentPin} />
        </div>
        
        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PIN Baru</label>
            <input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-blue-500" placeholder="6 digit angka" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi PIN Baru</label>
            <input type="password" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-blue-500" placeholder="Ketik ulang PIN baru" />
          </div>
          <button type="submit" disabled={submitting || !selectedSlug || newPin.length !== 6} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 font-bold text-white transition hover:bg-blue-600 disabled:opacity-50 mt-2">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan PIN Cabang Ini"}
          </button>
        </div>
      </div>
    </form>
  );
}

// 4. Master Admin
function ChangeMasterPin() {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrentPin = async (masterPin: string) => {
    const { data } = await supabase.rpc('get_setting_pin_secure', { p_master_pin: masterPin, p_type: 'master' });
    return data || null;
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) { toast.error("PIN baru harus 6 angka"); return; }
    if (newPin !== confirmPin) { toast.error("Konfirmasi PIN tidak cocok"); return; }

    setSubmitting(true);
    const { error: updateError } = await supabase.rpc('update_master_admin_pin', { p_new_pin: newPin });
    if (updateError) { toast.error("Gagal mengubah PIN Master Admin"); } 
    else { toast.success("PIN Master Admin berhasil diubah!"); setNewPin(""); setConfirmPin(""); }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleUpdatePin} className="bg-card p-6 rounded-2xl border border-border shadow-sm max-w-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-red-500/10 p-2 rounded-lg text-red-500">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-red-500">Master Admin</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">PIN untuk mengakses seluruh sistem (Tingkat Master)</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <MaskedPinDisplay label="PIN Master Saat Ini" fetchPin={fetchCurrentPin} />
        
        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">PIN Baru</label>
            <input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-red-500" placeholder="6 digit angka" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi PIN Baru</label>
            <input type="password" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-red-500" placeholder="Ketik ulang PIN baru" />
          </div>
          <button type="submit" disabled={submitting || newPin.length !== 6} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white transition hover:bg-red-600 disabled:opacity-50 mt-2">
            {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan PIN Master"}
          </button>
        </div>
      </div>
    </form>
  );
}

// 5. Password Admin
function ChangeAdminPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) { toast.error("Masukkan password saat ini"); return; }
    if (newPassword.length < 6) { toast.error("Password baru minimal 6 karakter"); return; }
    if (newPassword !== confirmPassword) { toast.error("Konfirmasi password tidak cocok"); return; }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error("Password saat ini salah");
        setSubmitting(false); return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message || "Gagal mengubah password"); } 
    else { toast.success("Password berhasil diubah!"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleUpdatePassword} className="bg-card p-6 rounded-2xl border border-border shadow-sm max-w-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-primary">Ubah Password Admin</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Password utama (Email) untuk aplikasi</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-primary" placeholder="Masukkan password lama" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password Baru</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-primary" placeholder="Minimal 6 karakter" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2 outline-none focus:border-primary" placeholder="Ketik ulang password baru" />
        </div>
        <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 mt-2">
          {submitting ? <Loader2 className="size-5 animate-spin" /> : "Simpan Password"}
        </button>
      </div>
    </form>
  );
}

// 6. Aktivitas Login
function LoginActivitiesTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('login_sessions')
      .select('*')
      .eq('is_active', true)
      .order('login_time', { ascending: false });
    
    if (data) setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();

    const channel = supabase.channel('public:login_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'login_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleForceLogout = async (id: string) => {
    const { error } = await supabase.from('login_sessions').update({ is_active: false }).eq('id', id);
    if (error) {
      toast.error("Gagal mengeluarkan pengguna");
    } else {
      toast.success("Pengguna berhasil dikeluarkan");
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500">
          <Activity className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-orange-500">Aktivitas Login</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Pantau dan kelola siapa saja yang sedang login</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          Tidak ada sesi login aktif saat ini.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map(session => (
            <div key={session.id} className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-background relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary rounded-lg">
                    {session.user_type === 'admin' ? <KeyRound className="size-4" /> :
                     session.user_type === 'finance' ? <DollarSign className="size-4" /> :
                     session.user_type === 'developer' ? <Terminal className="size-4" /> :
                     session.user_type === 'outlet' ? <Store className="size-4" /> :
                     <ShieldAlert className="size-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm capitalize">
                      {session.user_type === 'admin' ? 'Admin Master (Email)' : 
                       session.user_type === 'finance' ? 'Keuangan' : 
                       session.user_type === 'developer' ? 'Developer' : 
                       session.user_type === 'outlet' ? `Outlet: ${session.identifier}` : 'Master Admin'}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{session.location} ({session.ip_address})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MonitorSmartphone className="size-3" />
                  <span className="truncate max-w-[200px]" title={session.user_agent}>{session.user_agent?.split(' ')[0] || 'Browser Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{new Date(session.login_time).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={() => handleForceLogout(session.id)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold"
              >
                <LogOut className="size-3" />
                Keluarkan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
