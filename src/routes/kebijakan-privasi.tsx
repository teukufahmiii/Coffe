import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/kebijakan-privasi")({
  head: () => ({
    meta: [
      { title: "Kebijakan Privasi — LNR Coffee" },
    ],
  }),
  component: KebijakanPrivasiPage,
});

function KebijakanPrivasiPage() {
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
          Kebijakan & Privasi
        </h1>
      </div>

      <main className="flex-1 px-4 md:px-6 max-w-2xl mx-auto w-full pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <h2 className="font-display text-xl font-bold mb-4 text-[#5C4033]">Kebijakan Privasi LNR Coffee</h2>
          
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Terima kasih telah mengunjungi aplikasi LNR Coffee. Privasi dan keamanan data Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
            </p>

            <h3 className="font-bold text-black mt-6">1. Informasi yang Kami Kumpulkan</h3>
            <p>
              Kami dapat mengumpulkan informasi pribadi Anda seperti nama, nomor telepon (untuk registrasi dan login melalui PIN), serta riwayat pesanan Anda untuk keperluan operasional layanan LNR Coffee.
            </p>

            <h3 className="font-bold text-black mt-6">2. Penggunaan Informasi</h3>
            <p>
              Informasi yang Anda berikan akan digunakan untuk memproses pesanan, mengelola LNR Points, serta meningkatkan pengalaman dan layanan kami secara keseluruhan.
            </p>

            <h3 className="font-bold text-black mt-6">3. Keamanan Data</h3>
            <p>
              Kami mengambil langkah-langkah keamanan teknis dan administratif yang wajar untuk melindungi informasi pribadi Anda dari akses yang tidak sah atau penggunaan yang tidak semestinya.
            </p>

            <h3 className="font-bold text-black mt-6">4. Perubahan Kebijakan</h3>
            <p>
              Kebijakan privasi ini dapat berubah sewaktu-waktu. Kami akan memperbarui halaman ini jika terdapat perubahan yang signifikan dalam cara kami memproses data Anda.
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
