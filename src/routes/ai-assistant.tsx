import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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

const SYSTEM_PROMPT = `Anda adalah "LNR Asisten AI", asisten pintar untuk aplikasi LNR Coffee.
Tugas Anda adalah menjawab pertanyaan pelanggan seputar fitur aplikasi, menu, dan informasi kedai.
Aplikasi ini memiliki fitur:
- Pemesanan (Dine-in, Takeaway) menu Kopi, Non-Coffee, Snack
- KopiPedia (artikel edukasi kopi)
- Catering (pemesanan jumlah besar)
- Voucher (penukaran poin)
- LNR Referral (ajak teman dapat cuan)
- Pencarian Outlet terdekat (Google Maps)

ATURAN SANGAT PENTING (CRITICAL):
1. Anda TIDAK memiliki akses ke database pengguna, status pesanan, saldo akun, atau keranjang belanja secara real-time.
2. Jangan pernah mencoba menjawab informasi spesifik tentang transaksi atau data pribadi pengguna. Jika ditanya, katakan dengan jelas bahwa Anda tidak memiliki akses ke database untuk keamanan, dan sarankan mereka mengecek halaman "Pesanan" atau "Profil".
3. Jawab dengan bahasa Indonesia yang ramah, hangat, dan sopan selayaknya barista yang melayani pelanggan.
4. Format jawaban Anda senatural mungkin tanpa markdown rumit jika tidak diperlukan.`;

function AIAssistantPage() {
  const navigate = useNavigate();
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

      // Convert messages to Groq format (including system prompt)
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
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
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-black px-4 py-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="p-2 -ml-2 rounded-xl border border-transparent hover:border-black/10 hover:bg-black/5 transition-all"
        >
          <ChevronLeft className="size-6 text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-[#5C4033]" />
          <h1 className="font-display font-bold text-lg text-primary">LNR Asisten AI</h1>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* CHAT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-24 max-w-3xl mx-auto w-full">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 size-8 rounded-full grid place-items-center border-2 border-black shadow-sm
                ${msg.role === "user" ? "bg-primary text-white" : "bg-white text-[#5C4033]"}`}
              >
                {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              
              {/* Bubble */}
              <div className={`p-3 md:p-4 rounded-2xl border-2 border-black shadow-md
                ${msg.role === "user" 
                  ? "bg-primary text-white rounded-tr-sm" 
                  : "bg-white text-black rounded-tl-sm"}`}
              >
                {/* Apply Times New Roman explicitly to AI responses */}
                <p 
                  className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "font-serif" : ""}`}
                  style={msg.role === "assistant" ? { fontFamily: "'Times New Roman', Times, serif" } : {}}
                >
                  {msg.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex gap-3 max-w-[80%] flex-row">
              <div className="flex-shrink-0 size-8 rounded-full grid place-items-center border-2 border-black shadow-sm bg-white text-[#5C4033]">
                <Bot className="size-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm border-2 border-black bg-white shadow-md flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#5C4033]" />
                <span className="text-xs text-muted-foreground font-bold" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  AI sedang mengetik...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-3 md:p-4 z-40">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-[#F9F6F0] rounded-[24px] border-2 border-black p-1 pl-4 shadow-sm focus-within:shadow-md focus-within:border-[#5C4033] transition-all"
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
              placeholder="Tanya asisten tentang LNR..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none outline-none py-3 resize-none text-sm md:text-base"
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="mb-1 mr-1 p-3 rounded-full bg-primary text-white disabled:bg-gray-300 disabled:text-gray-500 hover:-translate-y-0.5 transition-all"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
