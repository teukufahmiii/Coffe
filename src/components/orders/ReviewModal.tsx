import { useState } from "react";
import { Star, X, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Order, OrderItem } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  initialRating?: number;
}

const REVIEW_TAGS = ["Rasa", "Kemasan", "Kecepatan", "Kebersihan", "Kenyamanan", "Tampilan Store"];

export function ReviewModal({ order, isOpen, onClose, initialRating = 0 }: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [productRatings, setProductRatings] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleProductRate = (itemId: string, isLike: boolean) => {
    setProductRatings(prev => ({ ...prev, [itemId]: isLike }));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Silakan berikan rating bintang terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format product ratings for jsonb
      const formattedProductRatings = Object.entries(productRatings).map(([itemId, liked]) => {
        const item = order.order_items?.find(i => i.id === itemId);
        return {
          item_id: itemId,
          name: item?.name || "Unknown Product",
          liked
        };
      });

      const { error } = await supabase.from("reviews").insert({
        order_id: order.id,
        branch_id: order.branch_id,
        rating,
        tags: selectedTags,
        comment,
        product_ratings: formattedProductRatings
      });

      if (error) {
        if (error.code === '23505') {
           toast.error("Anda sudah memberikan ulasan untuk pesanan ini.");
        } else {
           throw error;
        }
      } else {
        toast.success("Terima kasih atas ulasan Anda!");
        onClose();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-4 border-b border-border/50">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <X className="size-6 text-[#5C4033]" />
        </button>
        <h1 className="font-bold text-lg text-[#5C4033] absolute left-1/2 -translate-x-1/2">Penilaianmu</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-4 py-6">
        {/* Star Rating Section */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="font-bold text-lg mb-4 text-[#5C4033]">Gimana Pengalaman Belanjamu?</h2>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                className="focus:outline-none transition-transform active:scale-90"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
              >
                <Star 
                  className={`size-10 transition-colors ${
                    (hoveredStar || rating) >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "fill-border text-border"
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-sm mb-3">Apa yang kamu suka dari LNR Coffee?</h3>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  selectedTags.includes(tag)
                    ? "bg-[#5C4033] text-white border-[#5C4033]"
                    : "bg-white text-muted-foreground border-border hover:border-[#5C4033]/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-sm mb-3">Saran & Kritik</h3>
          <textarea
            placeholder="Komentarmu (Opsional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border-b border-border py-2 text-sm focus:outline-none focus:border-[#5C4033] resize-none transition-colors"
            rows={2}
          />
        </div>

        {/* Product Rating Section */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-sm text-[#5C4033] uppercase mb-4">Penilaian Produk</h3>
            <div className="space-y-6">
              {order.order_items.map((item, idx) => (
                <div key={item.id || idx} className="bg-white border border-border/50 p-4 rounded-xl shadow-sm">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="size-16 bg-[#5C4033]/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xl">☕</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#5C4033]">{item.name}</h4>
                      {item.note && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex border-t border-border/50 pt-3">
                    <button
                      onClick={() => handleProductRate(item.id || String(idx), true)}
                      className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-semibold transition-colors ${
                        productRatings[item.id || String(idx)] === true 
                          ? "text-[#5C4033]" 
                          : "text-muted-foreground hover:text-[#5C4033]/70"
                      }`}
                    >
                      <ThumbsUp className={`size-4 ${productRatings[item.id || String(idx)] === true ? "fill-[#5C4033]" : ""}`} /> Puas
                    </button>
                    <div className="w-px bg-border/50" />
                    <button
                      onClick={() => handleProductRate(item.id || String(idx), false)}
                      className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-semibold transition-colors ${
                        productRatings[item.id || String(idx)] === false 
                          ? "text-red-500" 
                          : "text-muted-foreground hover:text-red-500/70"
                      }`}
                    >
                      <ThumbsDown className={`size-4 ${productRatings[item.id || String(idx)] === false ? "fill-red-500" : ""}`} /> Tidak Puas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Submit Button */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full py-4 bg-[#5C4033] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="size-5 animate-spin" /> Mengirim...</>
          ) : (
            "KIRIM ULASAN"
          )}
        </button>
      </div>
    </div>
  );
}
