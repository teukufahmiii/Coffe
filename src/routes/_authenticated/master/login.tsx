import { createFileRoute } from "@tanstack/react-router";
import { LoginManager } from "@/components/admin/settings/LoginManager";

import { z } from "zod";

const searchSchema = z.object({
  tab: z.enum(["activity", "finance", "developer", "outlet", "master", "password"]).optional(),
});

export const Route = createFileRoute("/_authenticated/master/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Kelola Login — LNR Admin" }, { name: "robots", content: "noindex" }] }),
  component: MasterLoginSettings,
});

function MasterLoginSettings() {
  const search = Route.useSearch();
  const activeTab = search.tab || "activity";

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="font-display text-3xl font-bold">Kelola Akses Login</h1>
        <p className="text-sm text-muted-foreground mt-1">Atur kunci keamanan untuk master admin, developer, dan cabang-cabang.</p>
      </div>
      
      <LoginManager activeTab={activeTab} />
    </div>
  );
}
