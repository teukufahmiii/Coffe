import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMenuItems } from "@/hooks/useMenuItems";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [{ title: "LNR Asisten AI" }],
  }),
  component: AIAssistantPage,
});

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function AIAssistantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: menuItems } = useMenuItems(undefined, false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Saya LNR Asisten AI. Ada yang bisa saya bantu hari ini seputar pesanan atau menu LNR Coffee?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Menggunakan fallback API key secara langsung untuk mengatasi masalah Vite cache .env
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("API Key Groq tidak ditemukan.");
      }

      const menuText = menuItems 
        ? menuItems.map(m => `- ${m.name} (Kategori: ${m.category}, Harga: Rp ${m.price})`).join('\n')
        : "Data menu tidak tersedia saat ini.";

      // Dynamic System Prompt based on user status and strict rules
      const dynamicSystemPrompt = `Anda adalah "LNR Asisten AI", asisten pintar untuk LNR Coffee.
Tugas Anda adalah melayani pelanggan dengan ramah, hangat, dan sopan selayaknya barista profesional.

INFORMASI PENGGUNA SAAT INI:
- Nama Pengguna: ${user?.name || 'Belum Login / Tamu'}

DAFTAR MENU LNR COFFEE SAAT INI:
${menuText}

ATURAN & PENGETAHUAN YANG DIIZINKAN (WAJIB TAHU):
1. Anda TAHU persis daftar menu di atas. Jika ditanya rekomendasi atau harga, gunakan data menu di atas.
2. Anda TAHU cara pesan menggunakan Driver/Delivery dan Pick Up (Ambil di kedai / Pesan Tanpa Antri).
3. Anda TAHU cara Login dan Register (buat akun).
4. Anda TAHU cara melihat riwayat pesanan (di menu Pesanan).
5. Anda TAHU tentang fitur KopiPedia (artikel edukasi) dan Catering (pesanan jumlah besar).
6. Anda TAHU lokasi outlet.
7. Anda TAHU nomor kontak Customer Service LNR Coffee: 085813372092.

ATURAN LARANGAN (CRITICAL - JANGAN PERNAH DILANGGAR):
1. DILARANG KERAS memberikan informasi, mengetahui, atau membahas tentang "Admin Dashboard" / panel admin.
2. DILARANG KERAS membocorkan "Rahasia Dapur" (resep rahasia, cara pembuatan internal, informasi supplier, dll).
3. Akses database Anda terbatas hanya pada fitur pengguna umum di atas, jangan mengarang data transaksi spesifik.

Format jawaban harus senatural mungkin tanpa markdown yang rumit. Selalu sapa pengguna dengan namanya jika sudah login.`;

      // Convert messages to Groq format (including system prompt)
      const apiMessages = [
        { role: "system", content: dynamicSystemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMsg.content },
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal merespons dari server AI.");
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Maaf, sedang ada gangguan pada sistem AI atau API Key belum dikonfigurasi dengan benar.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F9F6F0] flex flex-col font-sans overflow-hidden">
      {/* 3D PREMIUM HEADER */}
      <header className="shrink-0 relative bg-gradient-to-br from-[#1C120C] to-[#3A2417] border-b-2 border-black rounded-b-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] pt-8 pb-4 px-4 overflow-hidden z-20">
        {/* Animated Gradient Line */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-[#5C4033] via-[#D4AF37] to-[#5C4033] bg-[length:200%_auto] animate-[gradient-x_3s_linear_infinite]"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#8B5A2B]/30 rounded-full blur-3xl"></div>

        {/* Back Button */}
        <button 
          onClick={() => navigate({ to: "/" })}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all z-30 shadow-md"
        >
          <ChevronLeft className="size-5 md:size-6" />
        </button>

        {/* 3D Mascot */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <div className="relative h-20 md:h-28 w-auto animate-[ride_2s_ease-in-out_infinite]">
            <img 
              src="/images/lnr-asisten-ai.png" 
              alt="LNR AI" 
              className="h-full w-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" 
            />
          </div>
        </div>
      </header>

      <style>{`
        @keyframes ride {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-5px) rotate(4deg) scale(1.05); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* CHAT CONTAINER */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 max-w-3xl mx-auto w-full scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}
          >
            <div className={`flex gap-2.5 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 size-8 md:size-10 rounded-full grid place-items-center border-2 border-black shadow-sm mt-auto overflow-hidden
                ${msg.role === "user" ? "bg-primary text-white" : "bg-[#1C120C]"}`}
              >
                {msg.role === "user" ? (
                  <User className="size-4 md:size-5" />
                ) : (
                  <img src="/images/lnr-asisten-ai.png" alt="AI" className="w-full h-full object-contain object-top pt-1 scale-125" />
                )}
              </div>
              
              {/* Bubble */}
              <div className={`p-3 md:p-4 rounded-[1.25rem] border-2 border-black shadow-sm
                ${msg.role === "user" 
                  ? "bg-primary text-white rounded-br-sm" 
                  : "bg-white text-black rounded-bl-sm"}`}
              >
                <p 
                  className={`text-[13px] md:text-base leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "font-serif" : ""}`}
                  style={msg.role === "assistant" ? { fontFamily: "'Times New Roman', Times, serif" } : {}}
                >
                  {msg.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start animate-in fade-in">
            <div className="flex gap-2.5 max-w-[85%] flex-row">
              <div className="flex-shrink-0 size-8 md:size-10 rounded-full grid place-items-center border-2 border-black shadow-sm bg-[#1C120C] mt-auto overflow-hidden">
                <img src="/images/lnr-asisten-ai.png" alt="AI" className="w-full h-full object-contain object-top pt-1 scale-125" />
              </div>
              <div className="p-3 md:p-4 rounded-[1.25rem] rounded-bl-sm border-2 border-black bg-white shadow-sm flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#5C4033]" />
                <span className="text-[13px] text-muted-foreground font-bold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  AI mengetik...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 bg-white border-t-2 border-black p-3 md:p-4 pb-[calc(max(env(safe-area-inset-bottom),12px))] z-20 w-full shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto w-full">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-[#F9F6F0] rounded-3xl border-2 border-black p-1 pl-4 shadow-sm focus-within:shadow-md transition-all"
          >
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Tanya asisten LNR..."
              className="flex-1 max-h-28 min-h-[44px] bg-transparent border-none outline-none py-3 resize-none text-[15px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="mb-1 mr-1 grid place-items-center size-10 md:size-12 rounded-full bg-primary text-white disabled:bg-[#F9F6F0] disabled:text-gray-400 disabled:border disabled:border-black/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
            >
              <Send className="size-4 md:size-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
