import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Gift, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";

export const Route = createFileRoute("/points")({
  component: PointsPage,
});

type PointVoucher = {
  id: string;
  code: string;
  title: string | null;
  discount_type: "percentage" | "fixed";
  discount_amount: number;
  points_required: number;
};

function PointsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [vouchers, setVouchers] = useState<PointVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // Fetch user points
      const { data: profile } = await supabase.from("profiles").select("points").eq("phone", user.phone).single();
      if (profile) setPoints(profile.points || 0);

      // Fetch point vouchers
      const { data: vData, error: vError } = await supabase
        .from("vouchers")
        .select("*")
        .gt("points_required", 0)
        .eq("is_active", true)
        .order("points_required", { ascending: true });
        
      if (vError && vError.message.includes("does not exist")) {
        // Fallback if migration hasn't been applied yet
        console.warn("Migration for points_required not applied. Using fallback.");
        setVouchers([
          { id: "fallback-1", code: "PTS-10", title: "Diskon 10%", discount_type: "percentage", discount_amount: 10, points_required: 20 },
          { id: "fallback-2", code: "PTS-20", title: "Diskon 20%", discount_type: "percentage", discount_amount: 20, points_required: 30 },
          { id: "fallback-3", code: "PTS-35", title: "Diskon 35%", discount_type: "percentage", discount_amount: 35, points_required: 50 },
        ]);
      } else if (vData) {
        setVouchers(vData);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, navigate, authLoading]);

  const handleClaim = async (voucher: PointVoucher) => {
    if (points < voucher.points_required) {
      toast.error(`Poin kamu tidak cukup! Kurang ${voucher.points_required - points} poin lagi.`);
      return;
    }

    if (!confirm(`Tukar ${voucher.points_required} Poin dengan Voucher ${voucher.title}?`)) {
      return;
    }

    setClaiming(voucher.id);
    try {
      // 1. Deduct points
      const newPoints = points - voucher.points_required;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("phone", user!.phone);
      
      if (updateError) throw updateError;
      
      setPoints(newPoints);
      toast.success(`Berhasil ditukar! Salin kode voucher: ${voucher.code}`, {
        action: {
          label: "Salin Kode",
          onClick: () => {
            navigator.clipboard.writeText(voucher.code);
            toast.success("Kode disalin!");
          }
        },
        duration: 8000
      });
      
    } catch (e: any) {
      toast.error("Gagal menukar poin: " + e.message);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="font-display text-lg font-bold">LNR Point</div>
          <div className="size-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        {/* POINTS BALANCE CARD */}
        <section className="bg-gradient-to-br from-[#5C4033] to-[#8C6239] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="size-32" />
          </div>
          <div className="relative z-10">
            <p className="text-white/80 font-medium text-sm mb-1">Total Poin Kamu</p>
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl md:text-6xl font-bold">{points}</span>
              <span className="text-xl md:text-2xl font-bold pb-1 md:pb-2">Pts</span>
            </div>
            <p className="mt-4 text-xs md:text-sm text-white/90 leading-relaxed max-w-[280px]">
              Kumpulkan poin setiap kali kamu memesan LNR Coffee dan tukarkan dengan voucher diskon menarik!
            </p>
          </div>
        </section>

        {/* REWARDS CATALOG */}
        <section>
          <h2 className="font-display text-xl font-bold text-primary mb-4">Tukar Poin</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-secondary animate-pulse rounded-2xl" />)}
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-border">
              <Gift className="size-10 text-muted-foreground mx-auto mb-2 opacity-20" />
              <p className="text-muted-foreground font-medium">Belum ada voucher poin yang tersedia saat ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map(v => {
                const canAfford = points >= v.points_required;
                
                return (
                  <div key={v.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-border rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="grid size-12 md:size-14 shrink-0 place-items-center rounded-xl bg-[#5C4033]/10 text-[#5C4033]">
                        <Star className="size-6 md:size-7" />
                      </div>
                      <div>
                        <h3 className="font-display text-base md:text-lg font-bold text-primary">{v.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Diskon {v.discount_type === 'percentage' ? `${v.discount_amount}%` : formatRupiah(v.discount_amount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#5C4033]">
                        <Star className="size-4" fill="currentColor" />
                        <span>{v.points_required} Pts</span>
                      </div>
                      <button 
                        onClick={() => handleClaim(v)}
                        disabled={claiming === v.id || !canAfford}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                          canAfford 
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm" 
                            : "bg-secondary text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {claiming === v.id ? "Menukar..." : "Tukar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
