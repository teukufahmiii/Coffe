import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock, ChevronRight } from "lucide-react";
import { KOPIPEDIA_ARTICLES } from "@/data/kopipedia";

export const Route = createFileRoute("/kopipedia")({
  head: () => ({ meta: [{ title: "KopiPedia — LNR Coffee" }] }),
  component: KopiPediaPage,
});

function KopiPediaPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="grid size-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="text-center flex items-center gap-2">
            <BookOpen className="size-5 text-[#5C4033]" />
            <div className="font-display text-lg font-bold">KopiPedia</div>
          </div>
          <div className="size-10" />
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-muted-foreground text-center mb-8 font-medium">Jelajahi dunia kopi dan temukan cerita menarik di balik secangkir kopi Anda.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KOPIPEDIA_ARTICLES.map((article) => (
            <Link 
              key={article.id}
              to={`/kopipedia/$articleId`}
              params={{ articleId: article.id }}
              className="flex flex-col gap-3 rounded-2xl bg-[#F9F6F0] p-5 border-2 border-black hover:-translate-y-2 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#5C4033] text-white px-2 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Clock className="size-3" /> {article.readTime}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-primary leading-tight group-hover:text-[#5C4033] transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
                {article.summary}
              </p>
              <div className="mt-2 text-sm font-bold text-[#5C4033] flex items-center gap-1">
                Baca Selengkapnya <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
