import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft, LogOut, User as UserIcon, Star, Ticket, Edit, Info, MapPin, ShieldCheck, FileText, ChevronRight, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
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
    <div className="min-h-screen bg-[#F6F3EC]">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-black hover:text-[#5C4033] transition-colors"
        >
          <ChevronLeft className="size-6" />
          <span className="font-bold text-sm md:text-base">Kembali</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full"
        >
          <LogOut className="size-4" /> Keluar
        </button>
      </header>

      <main className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mt-6 mb-10">
          <div className="size-24 rounded-full bg-white border-4 border-black shadow-lg flex items-center justify-center text-[#5C4033] mb-4 relative">
            <UserIcon className="size-10" />
            <div className="absolute bottom-0 right-0 bg-[#5C4033] p-1.5 rounded-full border-2 border-white text-white shadow-sm">
              <Edit className="size-3" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">{user.name}</h1>
          <p className="text-muted-foreground font-medium mt-1">+62 {user.phone}</p>
          

        </div>

        {/* PENGATURAN */}
        <section className="mt-8 mb-8">
          <div className="bg-white rounded-3xl md:rounded-[2rem] border-2 border-black shadow-sm p-4 md:p-6">
            <h2 className="font-display text-xl font-bold text-primary mb-6">
              Pengaturan
            </h2>
            
            <div className="flex flex-col gap-4">
              <Link to="/tentang" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <Info className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Tentang</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/lokasi" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <MapPin className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Outlet Kami</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Kebijakan & Privasi</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/" className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-black hover:-translate-y-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#5C4033]/10 text-[#5C4033]">
                    <FileText className="size-5" />
                  </div>
                  <div className="font-bold text-primary">Syarat & Ketentuan</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#5C4033] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </section>



      </main>
    </div>
  );
}
