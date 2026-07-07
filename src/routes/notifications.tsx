import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

type Notification = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat notifikasi");
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="p-2 hover:bg-accent/10 rounded-full transition-colors text-primary">
          <ChevronLeft className="size-6" />
        </Link>
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <h1 className="font-display text-lg md:text-xl font-bold text-primary">Notifikasi</h1>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 mx-auto w-full max-w-lg">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-accent/10 p-4 rounded-full mb-4">
              <Bell className="size-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Belum ada Notifikasi</h2>
            <p className="text-sm text-muted-foreground">Promo dan pengumuman terbaru akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white rounded-2xl p-4 shadow-sm border-2 border-black/5 hover:border-black/10 transition-colors">
                {notif.image_url && (
                  <img src={notif.image_url} alt={notif.title} className="w-full h-auto object-cover rounded-xl mb-4" />
                )}
                <h2 className="font-bold text-lg md:text-xl text-primary mb-1">{notif.title}</h2>
                <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap">{notif.content}</p>
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-[10px] md:text-xs text-muted-foreground/80 font-medium bg-accent/5 px-3 py-1 rounded-full">
                    {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
