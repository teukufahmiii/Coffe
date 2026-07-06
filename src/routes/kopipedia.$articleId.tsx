import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Share2, Clock, BookOpen } from "lucide-react";
import { KOPIPEDIA_ARTICLES } from "@/data/kopipedia";
import { toast } from "sonner";

export const Route = createFileRoute("/kopipedia/$articleId")({
  component: KopipediaArticlePage,
});

function KopipediaArticlePage() {
  const navigate = useNavigate();
  const { articleId } = useParams({ from: "/kopipedia/$articleId" });
  
  const article = KOPIPEDIA_ARTICLES.find(a => a.id === articleId);

  const handleShare = () => {
    // Mock share functionality
    navigator.clipboard.writeText(window.location.href);
    toast.success("Tautan artikel disalin!");
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F6F3EC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
        <button onClick={() => navigate({ to: "/" })} className="bg-[#5C4033] text-white px-6 py-2 rounded-full font-bold">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col relative pb-24">
      {/* Header Fixed */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F6F3EC]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b-2 border-black/10">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-black hover:text-[#5C4033] transition-colors bg-white rounded-full px-3 py-1.5 border-2 border-black shadow-sm"
        >
          <ChevronLeft className="size-5" />
          <span className="font-bold text-sm hidden md:block">Kembali</span>
        </button>
        <button 
          onClick={handleShare}
          className="grid size-10 place-items-center bg-white rounded-full border-2 border-black shadow-sm text-black hover:bg-[#5C4033] hover:text-white transition-colors"
        >
          <Share2 className="size-4" />
        </button>
      </header>

      {/* Hero Header Article */}
      <div className="pt-24 px-6 md:px-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider bg-[#5C4033] text-white px-3 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {article.category}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-bold">
            <Clock className="size-4" /> {article.readTime}
          </span>
        </div>
        
        <h1 className="font-display text-3xl md:text-5xl font-black text-primary leading-tight mb-6">
          {article.title}
        </h1>
        
        <p className="text-lg md:text-xl font-medium text-muted-foreground leading-relaxed border-l-4 border-[#5C4033] pl-4 mb-10">
          {article.summary}
        </p>

        {/* Content Body */}
        <div className="bg-white rounded-3xl border-2 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="prose prose-lg md:prose-xl max-w-none prose-p:text-gray-800 prose-p:leading-relaxed prose-headings:font-display prose-headings:text-primary">
            {article.content.map((paragraph, index) => {
              // Handle simple markdown-like bold for our array
              const isBoldStart = paragraph.startsWith("**");
              if (isBoldStart) {
                const parts = paragraph.split("**");
                return (
                  <p key={index} className="mb-6">
                    <strong>{parts[1]}</strong>{parts[2]}
                  </p>
                )
              }
              return <p key={index} className="mb-6">{paragraph}</p>;
            })}
          </div>
        </div>

        {/* Ending Footer */}
        <div className="mt-12 flex flex-col items-center justify-center text-center opacity-70">
          <BookOpen className="size-8 text-[#5C4033] mb-4" />
          <p className="font-display font-bold text-lg text-primary">KopiPedia</p>
          <p className="text-sm font-medium">Bawa inspirasi di setiap tegukan.</p>
        </div>
      </div>
    </div>
  );
}
