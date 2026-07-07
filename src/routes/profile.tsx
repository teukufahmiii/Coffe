import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft, LogOut, User as UserIcon, Star, Ticket, Edit, Info, MapPin, ShieldCheck, FileText, ChevronRight, Clock, HelpCircle, Check, X, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [uploading, setUploading] = useState(false);
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
    <div className="min-h-screen bg-[#F6F3EC] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#5C4033]/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#5C4033]/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 pt-10 pb-2 flex items-center justify-between relative z-10">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-primary bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm hover:bg-white hover:shadow-md transition-all"
        >
          <ChevronLeft className="size-5" />
          <span className="font-bold text-sm">Kembali</span>
        </button>
      </header>

      <main className="px-6 pb-24 max-w-2xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mt-6 mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#5C4033]/10 rounded-full blur-2xl -z-10"></div>
          
          <div className="relative mb-5 group">
            <div className="size-28 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-[#5C4033] overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="size-12 opacity-80" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 bg-[#5C4033] p-2.5 rounded-full border-[3px] border-[#F6F3EC] text-white shadow-lg hover:scale-110 hover:bg-[#4A332A] active:scale-95 transition-all cursor-pointer"
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
          
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2 animate-in fade-in zoom-in duration-200">
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="font-display text-2xl font-black text-primary text-center bg-white border border-[#5C4033]/20 shadow-sm rounded-xl px-4 py-1.5 outline-none focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20"
                autoFocus
              />
              <button onClick={handleNameSave} className="p-2.5 bg-[#5C4033] text-white rounded-xl shadow-md hover:bg-[#4A332A] transition-colors">
                <Check className="size-5" />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer mb-1" onClick={() => { setNewName(user.name); setIsEditingName(true); }}>
              <h1 className="font-display text-3xl md:text-4xl font-black text-primary tracking-tight">{user.name}</h1>
              <div className="bg-[#5C4033]/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <Edit className="size-4 text-[#5C4033]" />
              </div>
            </div>
          )}
          
          <div className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm mt-1">
            <span className="text-muted-foreground font-semibold text-sm tracking-wide">+62 {user.phone}</span>
          </div>
        </div>

        {/* PENGATURAN */}
        <section className="mb-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 md:p-8">
            <h2 className="font-display text-xl font-bold text-primary mb-6 px-2">
              Pengaturan Akun
            </h2>
            
            <div className="flex flex-col gap-3">
              <Link to="/tentang" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <HelpCircle className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Pusat Bantuan</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link to="/tentang" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <Info className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Tentang LNR</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link to="/lokasi" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <MapPin className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Outlet Kami</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <div className="h-px bg-border/50 my-2 mx-4" />

              <Link to="/" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Kebijakan & Privasi</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>

              <Link to="/" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40 hover:border-[#5C4033]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 place-items-center rounded-full bg-[#5C4033]/5 text-[#5C4033] group-hover:bg-[#5C4033] group-hover:text-white transition-colors duration-300">
                    <FileText className="size-5" />
                  </div>
                  <div className="font-bold text-foreground/90 group-hover:text-[#5C4033] transition-colors duration-300">Syarat & Ketentuan</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground/50 group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
              
              <div className="h-px bg-border/50 my-2 mx-4" />

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
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
                    toast.success('Permintaan hapus akun terkirim.');
                    handleLogout();
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
    </div>
  );
}
