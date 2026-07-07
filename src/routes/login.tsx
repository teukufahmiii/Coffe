import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Phone, Lock, User, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, register, checkPhone } = useAuth();
  
  const [step, setStep] = useState<"phone" | "pin_login" | "name_register" | "pin_register">("phone");
  const [loading, setLoading] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [existingName, setExistingName] = useState("");

  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "pin_login" || step === "pin_register") {
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      toast.error("Nomor HP tidak valid");
      return;
    }
    
    setLoading(true);
    const result = await checkPhone(phone);
    setLoading(false);
    
    if (result.exists) {
      setExistingName(result.name || "");
      setStep("pin_login");
    } else {
      setStep("name_register");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      toast.error("PIN harus 6 angka");
      return;
    }
    
    setLoading(true);
    const result = await login(phone, pin);
    setLoading(false);
    
    if (result.success) {
      toast.success(`Selamat datang kembali, ${existingName || phone}!`);
      navigate({ to: "/" }); // Ganti ke / setelah sukses wajib login
    } else {
      toast.error(result.message);
      setPin("");
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error("Nama minimal 3 karakter");
      return;
    }
    setStep("pin_register");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      toast.error("PIN harus 6 angka");
      return;
    }
    
    setLoading(true);
    const result = await register(phone, name, pin);
    setLoading(false);
    
    if (result.success) {
      toast.success("Pendaftaran berhasil!");
      navigate({ to: "/" }); // Ganti ke / setelah sukses wajib login
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4">
        <button 
          onClick={() => {
            if (step === "pin_login") setStep("phone");
            else if (step === "name_register") setStep("phone");
            else if (step === "pin_register") setStep("name_register");
          }}
          className={`flex items-center gap-2 text-black hover:text-[#5C4033] transition-colors ${step === "phone" ? "invisible" : ""}`}
        >
          <ChevronLeft className="size-6" />
          <span className="font-bold text-sm md:text-base">Kembali</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-black p-6 md:p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-primary mb-2">
              {step === "phone" && "Masuk atau Daftar"}
              {step === "pin_login" && "Masukkan PIN"}
              {step === "name_register" && "Lengkapi Profil"}
              {step === "pin_register" && "Buat PIN Baru"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "phone" && "Masukkan nomor HP Anda untuk melanjutkan."}
              {step === "pin_login" && `Selamat datang kembali, ${existingName}! Masukkan PIN 6 digit Anda.`}
              {step === "name_register" && "Nomor Anda belum terdaftar. Masukkan nama Anda."}
              {step === "pin_register" && "Buat 6 digit PIN untuk keamanan akun Anda."}
            </p>
          </div>

          {/* STEP: PHONE */}
          {step === "phone" && (
            <form onSubmit={handleCheckPhone} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033]">Nomor Handphone</label>
                <div className="flex bg-[#F9F6F0] rounded-xl border-2 border-border/50 focus-within:border-black transition-colors overflow-hidden">
                  <div className="px-4 py-3 bg-black/5 flex items-center justify-center font-bold text-muted-foreground border-r border-border/50">
                    +62
                  </div>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="81234567890"
                    className="flex-1 bg-transparent px-4 py-3 outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading || phone.length < 9}
                className="w-full py-4 rounded-xl bg-[#5C4033] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#4A332A] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
                Lanjutkan
              </button>
            </form>
          )}

          {/* STEP: PIN LOGIN */}
          {step === "pin_login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033] text-center block">PIN (6 Angka)</label>
                <input 
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-[#F9F6F0] rounded-xl border-2 border-border/50 focus:border-black transition-colors px-4 py-4 outline-none font-display text-2xl text-center tracking-[1em]"
                  ref={pinInputRef}
                  autoFocus
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full py-4 rounded-xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
                Masuk
              </button>
            </form>
          )}

          {/* STEP: NAME REGISTER */}
          {step === "name_register" && (
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033]">Nama Lengkap</label>
                <div className="flex items-center gap-3 bg-[#F9F6F0] rounded-xl border-2 border-border/50 focus-within:border-black transition-colors px-4 py-3">
                  <User className="size-5 text-muted-foreground" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="flex-1 bg-transparent outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={name.length < 3}
                className="w-full py-4 rounded-xl bg-[#5C4033] text-white font-bold mt-2 hover:bg-[#4A332A] transition-colors disabled:opacity-70"
              >
                Lanjutkan
              </button>
            </form>
          )}

          {/* STEP: PIN REGISTER */}
          {step === "pin_register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033] text-center block">Buat PIN (6 Angka)</label>
                <input 
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-[#F9F6F0] rounded-xl border-2 border-border/50 focus:border-black transition-colors px-4 py-4 outline-none font-display text-2xl text-center tracking-[1em]"
                  ref={pinInputRef}
                  autoFocus
                />
                <p className="text-xs text-center text-muted-foreground mt-2">PIN hanya boleh berisi 6 angka. Jangan gunakan huruf.</p>
              </div>
              
              <button 
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full py-4 rounded-xl bg-[#5C4033] text-white font-bold mt-2 hover:bg-[#4A332A] transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : "Selesai & Daftar"}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
