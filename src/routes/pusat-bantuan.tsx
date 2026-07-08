import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/pusat-bantuan")({
  head: () => ({
    meta: [
      { title: "Pusat Bantuan & FAQ — LNR Coffee" },
    ],
  }),
  component: PusatBantuanPage,
});

const faqs = [
  {
    question: "Bagaimana cara memesan kopi di LNR Coffee?",
    answer: "Anda dapat memesan langsung melalui aplikasi ini dengan memilih menu yang tersedia di halaman utama, memasukkannya ke keranjang, dan melakukan pembayaran secara online atau bayar di kasir."
  },
  {
    question: "Apa itu LNR Points dan bagaimana cara mendapatkannya?",
    answer: "LNR Points adalah program loyalitas kami. Anda akan mendapatkan 1 poin untuk setiap pembelian 1 menu. Jika membeli lebih dari 1 menu dalam satu transaksi, Anda akan mendapatkan 3 poin. Poin dapat ditukar dengan voucher diskon khusus."
  },
  {
    question: "Bagaimana cara menukar LNR Points dengan voucher?",
    answer: "Buka menu LNR Points yang ada di beranda, di bawah nama profil Anda. Anda akan melihat daftar voucher yang tersedia (misal: 20 poin = diskon 10%). Tekan tombol 'Tukarkan' pada voucher yang Anda inginkan."
  },
  {
    question: "Apakah saya bisa mengubah nomor telepon atau PIN?",
    answer: "Nomor telepon yang sudah terdaftar tidak dapat diubah. Namun, Anda dapat mengubah PIN Anda melalui menu Profil -> Pengaturan Akun -> Ganti PIN."
  },
  {
    question: "Apa yang harus dilakukan jika saya lupa PIN?",
    answer: "Saat ini fitur lupa PIN belum tersedia secara otomatis. Silakan hubungi customer service kami atau kunjungi outlet terdekat untuk meminta bantuan reset akun Anda."
  }
];

function PusatBantuanPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 md:px-6 shadow-sm border-b border-black/5 flex items-center sticky top-0 z-50">
        <button 
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-black/5 transition-colors absolute left-4"
        >
          <ChevronLeft className="size-6 text-[#5C4033]" />
        </button>
        <h1 className="font-display font-bold text-lg md:text-xl text-[#5C4033] mx-auto">
          Pusat Bantuan & FAQ
        </h1>
      </div>

      <main className="flex-1 px-4 md:px-6 max-w-2xl mx-auto w-full pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 mb-6">
          <h2 className="font-display text-xl font-bold mb-2 text-[#5C4033]">Pertanyaan Umum (FAQ)</h2>
          <p className="text-sm text-gray-500 mb-6">Temukan jawaban atas pertanyaan yang sering diajukan seputar layanan LNR Coffee.</p>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#5C4033] bg-[#5C4033]/5' : 'border-black/5 bg-white'}`}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                >
                  <span className="font-bold text-sm text-gray-800 pr-4">{faq.question}</span>
                  <ChevronDown className={`size-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#5C4033]' : ''}`} />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="p-4 pt-0 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#5C4033] rounded-2xl p-6 text-white text-center shadow-lg">
          <h3 className="font-display font-bold text-lg mb-2">Masih butuh bantuan?</h3>
          <p className="text-sm opacity-90 mb-4">Tim Customer Service kami siap membantu Anda setiap hari pukul 08:00 - 22:00.</p>
          <a 
            href="mailto:support@lnrcoffee.com" 
            className="inline-block bg-white text-[#5C4033] font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Hubungi CS Kami
          </a>
        </div>
      </main>
    </div>
  );
}
