import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

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

