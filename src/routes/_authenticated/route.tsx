import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  component: AuthenticatedWrapper,
});

function AuthenticatedWrapper() {
  const navigate = Route.useNavigate();

  useEffect(() => {
    const sessionId = localStorage.getItem('admin_session_id');
    if (!sessionId) return;

    const channel = supabase.channel(`admin_session_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'login_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (payload.new && payload.new.is_active === false) {
            localStorage.removeItem('admin_session_id');
            supabase.auth.signOut().then(() => {
              toast.error("Sesi Admin Anda dihentikan oleh Master Admin");
              navigate({ to: "/admin/login" });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return <Outlet />;
}
