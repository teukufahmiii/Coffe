import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/syarat-ketentuan")({
  head: () => ({
    meta: [
      { title: "Syarat & Ketentuan — LNR Coffee" },
    ],
  }),
  component: SyaratKetentuanPage,
});

function SyaratKetentuanPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 md:px-6 shadow-sm border-b border-black/5 flex items-center sticky top-0 z-50">
        <button 
          onClick={() => navigate({ to: "/profile" })}
          className="p-2 rounded-full hover:bg-black/5 transition-colors absolute left-4"
        >
          <ChevronLeft className="size-6 text-[#5C4033]" />
        </button>
        <h1 className="font-display font-bold text-lg md:text-xl text-[#5C4033] mx-auto">
          Syarat & Ketentuan
        </h1>
      </div>

      <main className="flex-1 px-4 md:px-6 max-w-2xl mx-auto w-full pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <h2 className="font-display text-xl font-bold mb-4 text-[#5C4033]">Syarat & Ketentuan Layanan</h2>
          
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Dengan mendaftar, mengakses, atau menggunakan layanan aplikasi LNR Coffee, Anda menyetujui seluruh syarat dan ketentuan yang berlaku di bawah ini. Harap membacanya dengan saksama.
            </p>

            <h3 className="font-bold text-black mt-6">1. Akun Pengguna</h3>
            <p>
              Setiap pengguna bertanggung jawab untuk menjaga kerahasiaan PIN dan informasi akun masing-masing. LNR Coffee tidak bertanggung jawab atas kerugian yang ditimbulkan akibat kelalaian pengguna dalam menjaga PIN.
            </p>

            <h3 className="font-bold text-black mt-6">2. Pemesanan dan Transaksi</h3>
            <p>
              Harga menu dan ketersediaan dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Pastikan pesanan Anda sudah benar sebelum melanjutkan ke pembayaran.
            </p>

            <h3 className="font-bold text-black mt-6">3. LNR Points dan Voucher</h3>
            <p>
              LNR Points tidak dapat diuangkan dan hanya dapat ditukarkan dengan voucher diskon yang telah ditentukan. Voucher yang telah ditukarkan memiliki masa berlaku dan tidak dapat dikembalikan.
            </p>

            <h3 className="font-bold text-black mt-6">4. Perilaku Pengguna</h3>
            <p>
              Pengguna dilarang keras melakukan tindakan yang dapat merugikan sistem aplikasi, penyalahgunaan voucher, atau melakukan penipuan dalam bentuk apa pun.
            </p>

            <div className="mt-8 pt-6 border-t border-black/5 text-xs text-gray-500">
              Terakhir diperbarui: 8 Juli 2026
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
