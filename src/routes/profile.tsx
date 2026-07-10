import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft, LogOut, User as UserIcon, Star, Ticket, Edit, Info, MapPin, ShieldCheck, FileText, ChevronRight, Clock, HelpCircle, Check, X, Camera, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePin, deleteAccount } = useAuth();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Pilih gambar terlebih dahulu.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.phone}-${Math.random()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update profile
      await updateProfile({ avatar_url: data.publicUrl });
      toast.success('Foto profil berhasil diperbarui!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      setIsEditingName(false);
      return;
    }
    
    const success = await updateProfile({ name: newName });
    if (success) {
      toast.success('Nama berhasil diperbarui!');
    }
    setIsEditingName(false);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmNewPin) {
      toast.error("PIN baru dan konfirmasi tidak cocok");
      return;
    }
    if (newPin.length !== 6) {
      toast.error("PIN baru harus 6 angka");
      return;
    }
    setPinLoading(true);
    const result = await changePin(oldPin, newPin);
    setPinLoading(false);
    
    if (result.success) {
      toast.success(result.message);
      setShowPinModal(false);
      setOldPin("");
      setNewPin("");
      setConfirmNewPin("");
    } else {
      toast.error(result.message);
    }
  };

  // If not logged in, should ideally redirect to login, but since this is mock, 
  // we just show a fallback if somehow they bypass the check.
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F3EC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Anda belum masuk</h1>
        <button onClick={() => navigate({ to: "/login" })} className="bg-[#5C4033] text-white px-6 py-2 rounded-full font-bold">
          Masuk Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] relative overflow-hidden pb-24">
      {/* Subtle Background pattern instead of solid brown */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 pt-10 pb-2 flex items-center justify-between relative z-20">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="flex items-center justify-center size-10 bg-white shadow-sm rounded-full border border-black/5 text-[#5C4033] hover:bg-black/5 hover:scale-105 transition-all"
        >
          <ChevronLeft className="size-6" />
        </button>
        <span className="font-display font-bold text-primary text-lg tracking-wide">Profil Akun</span>
        <div className="size-10"></div> {/* Spacer */}
      </header>

      <main className="px-4 md:px-6 max-w-2xl mx-auto relative z-20 mt-16 md:mt-20">
        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-xl border border-black/5 p-6 pt-12 relative flex flex-col items-center text-center mb-8">
          
          {/* Avatar overhanging the card */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 group">
            <div className="size-32 rounded-full bg-gradient-to-br from-[#F9F6F0] to-white p-1.5 shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:shadow-lg">
              <div className="size-full rounded-full bg-[#F6F3EC] flex items-center justify-center overflow-hidden border-4 border-white text-[#5C4033]">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="size-14 opacity-70" />
                )}
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 bg-[#5C4033] p-2.5 rounded-full border-4 border-white text-white shadow-lg hover:scale-110 hover:bg-[#4A332A] active:scale-95 transition-all cursor-pointer"
            >
              {uploading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          {/* User Details */}
          <div className="mt-4 w-full">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2 mb-2 animate-in fade-in zoom-in duration-200">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="font-display text-2xl font-black text-primary text-center bg-[#F9F6F0] border-2 border-[#5C4033]/20 shadow-inner rounded-xl px-4 py-2 outline-none focus:border-[#5C4033] focus:ring-4 focus:ring-[#5C4033]/10 w-full max-w-[200px]"
                  autoFocus
                />
                <button onClick={handleNameSave} className="p-2.5 bg-[#5C4033] text-white rounded-xl shadow-md hover:bg-[#4A332A] transition-colors shrink-0">
                  <Check className="size-5" />
                </button>
                <button onClick={() => setIsEditingName(false)} className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors shrink-0">
                  <X className="size-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 group cursor-pointer mb-2" onClick={() => { setNewName(user.name); setIsEditingName(true); }}>
                <h1 className="font-display text-3xl md:text-4xl font-black text-primary tracking-tight">{user.name}</h1>
                <div className="bg-[#5C4033]/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <Edit className="size-4 text-[#5C4033]" />
                </div>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 bg-[#F9F6F0] px-4 py-1.5 rounded-full border border-black/5 shadow-inner">
              <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest text-[#5C4033] opacity-80">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* PENGATURAN */}
        <section className="mb-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 md:p-8">
            <h2 className="font-display text-xl font-bold text-primary mb-6 px-2">
              Pengaturan Akun
            </h2>
            
            <div className="flex flex-col gap-3">
              <Link to="/pusat-bantuan" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/10 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <HelpCircle className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Pusat Bantuan</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link to="/tentang" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/10 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <Info className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Tentang LNR</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link to="/nearest-outlets" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/10 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <MapPin className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Outlet Kami</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <div className="h-px bg-black/10 my-2 mx-4" />

              <Link to="/kebijakan-privasi" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/10 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Kebijakan & Privasi</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link to="/syarat-ketentuan" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/10 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <FileText className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Syarat & Ketentuan</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
              
              <div className="h-px bg-black/10 my-2 mx-4" />

              <button 
                onClick={() => setShowPinModal(true)}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/10 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group w-full"
              >
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <Lock className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Ganti PIN</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-red-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-300 group w-full"
              >
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                    <LogOut className="size-5" />
                  </div>
                  <div className="font-bold text-red-500">Keluar Akun</div>
                </div>
                <ChevronRight className="size-5 text-red-200 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300" />
              </button>

              <button 
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin menghapus akun secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
                    const success = await deleteAccount();
                    if (success) {
                      toast.success('Akun Anda telah berhasil dihapus.');
                      navigate({ to: "/login" });
                    }
                  }
                }}
                className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-200 hover:bg-red-50 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-300 group w-full mt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <X className="size-5" />
                  </div>
                  <div className="font-bold text-red-600">Hapus Akun Permanen</div>
                </div>
                <ChevronRight className="size-5 text-red-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Ganti PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-xl text-[#5C4033]">Ganti PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">PIN Sebelumnya</label>
                <input 
                  type="password" 
                  maxLength={6}
                  inputMode="numeric"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#F9F6F0] border-transparent focus:bg-white focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-bold outline-none transition-all"
                  placeholder="••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">PIN Baru</label>
                <input 
                  type="password" 
                  maxLength={6}
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#F9F6F0] border-transparent focus:bg-white focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-bold outline-none transition-all"
                  placeholder="••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ulangi PIN Baru</label>
                <input 
                  type="password" 
                  maxLength={6}
                  inputMode="numeric"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#F9F6F0] border-transparent focus:bg-white focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-bold outline-none transition-all"
                  placeholder="••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={pinLoading || oldPin.length !== 6 || newPin.length !== 6 || confirmNewPin.length !== 6}
                className="w-full mt-6 bg-[#5C4033] hover:bg-[#4A332A] text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pinLoading ? <Loader2 className="size-5 animate-spin" /> : "Simpan PIN Baru"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
