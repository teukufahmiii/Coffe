import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MessageCircle, Phone, Lock, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Steps: 1 = Phone, 2 = OTP, 3 = Profile & PIN
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      toast.error("Nomor WhatsApp tidak valid");
      return;
    }
    toast.success("Kode OTP telah dikirim ke WhatsApp Anda!");
    setStep(2);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error("Masukkan kode OTP yang valid");
      return;
    }
    toast.success("Nomor WhatsApp terverifikasi!");
    setStep(3);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length < 6) {
      toast.error("Mohon lengkapi Nama dan PIN (6 digit)");
      return;
    }
    
    // Simulate login
    login(phone, name, pin);
    toast.success("Berhasil masuk!");
    navigate({ to: "/profile" });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate({ to: "/" })}
          className="flex items-center gap-2 text-black hover:text-[#5C4033] transition-colors"
        >
          <ChevronLeft className="size-6" />
          <span className="font-bold text-sm md:text-base">Kembali</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-black p-6 md:p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-primary mb-2">
              {step === 1 ? "Masuk ke Akun" : step === 2 ? "Verifikasi WhatsApp" : "Profil & Keamanan"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 && "Masukkan nomor WhatsApp yang terdaftar atau untuk mendaftar baru."}
              {step === 2 && `Kami telah mengirimkan 4 digit kode OTP ke nomor +62${phone}`}
              {step === 3 && "Lengkapi nama Anda dan buat 6 digit PIN untuk keamanan transaksi."}
            </p>
          </div>

          {/* STEP 1: PHONE */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033]">Nomor WhatsApp</label>
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
                className="w-full py-4 rounded-xl bg-[#5C4033] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#4A332A] transition-colors"
              >
                <MessageCircle className="size-5" />
                Kirim Kode OTP
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033] text-center block">Kode OTP (4 Digit)</label>
                <input 
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full bg-[#F9F6F0] rounded-xl border-2 border-border/50 focus:border-black transition-colors px-4 py-4 outline-none font-display text-2xl text-center tracking-[1em]"
                  autoFocus
                />
              </div>
              
              <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
              >
                <CheckCircle2 className="size-5" />
                Verifikasi OTP
              </button>
            </form>
          )}

          {/* STEP 3: NAME & PIN */}
          {step === 3 && (
            <form onSubmit={handleComplete} className="flex flex-col gap-5">
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

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5C4033]">Buat PIN Keamanan</label>
                <div className="flex items-center gap-3 bg-[#F9F6F0] rounded-xl border-2 border-border/50 focus-within:border-black transition-colors px-4 py-3">
                  <Lock className="size-5 text-muted-foreground" />
                  <input 
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 Digit PIN"
                    className="flex-1 bg-transparent outline-none font-display tracking-widest text-lg"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">PIN digunakan saat melakukan pembayaran dan klaim voucher.</p>
              </div>
              
              <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-[#5C4033] text-white font-bold mt-2 hover:bg-[#4A332A] transition-colors"
              >
                Selesai & Masuk
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
