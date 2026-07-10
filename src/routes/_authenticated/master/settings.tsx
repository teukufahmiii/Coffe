import { createFileRoute } from "@tanstack/react-router";
import { WebsiteManager } from "@/components/admin/settings/WebsiteManager";
import { MasterMenuManager } from "@/components/admin/settings/MasterMenuManager";
import { UserManager } from "@/components/admin/settings/UserManager";
import { VoucherManager } from "@/components/admin/settings/VoucherManager";
import { NotificationManager } from "@/components/admin/settings/NotificationManager";
import { QrManager } from "@/components/admin/settings/QrManager";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/master/settings")({
  validateSearch: (search) => ({
    tab: (search.tab as string) || "website",
  }),
  component: MasterSettings,
});

function MasterSettings() {
  const { tab: activeTab } = Route.useSearch();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl text-primary">Kelola Website</h1>
        <p className="text-sm text-muted-foreground">Kelola banner promosi, voucher, dan pengaturan lainnya untuk seluruh cabang</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        {activeTab === "website" && <WebsiteManager />}
        {activeTab === "menu" && <MasterMenuManager />}
        {activeTab === "users" && <UserManager />}
        {activeTab === "vouchers" && <VoucherManager />}
        {activeTab === "notifications" && <NotificationManager />}
        {activeTab === "qr" && <QrManager />}
      </div>
    </div>
  );
}
