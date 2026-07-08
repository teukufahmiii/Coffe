import { useEffect, useState } from "react";
import { Loader2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ReviewBoard({ branch }: { branch: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const { data: bData } = await supabase.from("branches").select("id").eq("slug", branch).single();
        if (!bData) return;
        
        const { data, error } = await supabase
          .from("reviews")
          .select("*, orders(customer_name, id, created_at)")
          .eq("branch_id", bData.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error("Error fetching reviews", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [branch]);

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
        <Star className="size-12 text-muted-foreground opacity-20" />
        <div>
          <h3 className="font-semibold text-lg">Belum ada ulasan</h3>
          <p className="text-sm text-muted-foreground">Ulasan dari pelanggan cabang ini akan muncul di sini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((r) => (
        <div key={r.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
           <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-base">{r.orders?.customer_name || "Pelanggan LNR"}</div>
                <div className="text-xs text-muted-foreground">Order #{r.order_id?.slice(0,8).toUpperCase()}</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{r.rating}</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
           </div>
           
           {r.tags && r.tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mb-3">
               {r.tags.map((tag: string, i: number) => (
                 <span key={i} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                   {tag}
                 </span>
               ))}
             </div>
           )}
           
           {r.comment && (
             <div className="mb-4 text-sm italic text-muted-foreground bg-accent/30 p-3 rounded-lg border border-border/50">
               "{r.comment}"
             </div>
           )}
           
           {r.product_ratings && r.product_ratings.length > 0 && (
             <div className="border-t border-border/50 pt-3 mt-auto">
               <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Produk</div>
               <div className="space-y-1.5">
                 {r.product_ratings.map((pr: any, i: number) => (
                   <div key={i} className="flex justify-between items-center text-xs">
                     <span className="truncate pr-2">{pr.name}</span>
                     <div className="shrink-0">
                       {pr.liked ? (
                         <span className="flex items-center gap-1 text-primary font-medium"><ThumbsUp className="size-3 fill-primary" /> Puas</span>
                       ) : (
                         <span className="flex items-center gap-1 text-destructive font-medium"><ThumbsDown className="size-3 fill-destructive" /> Tdk Puas</span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      ))}
    </div>
  );
}
