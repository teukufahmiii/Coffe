import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useState } from "react";
import { Globe, Ticket, BellRing, QrCode, Coffee, Users, ShieldCheck } from "lucide-react";

import { WebsiteManager } from "@/components/admin/settings/WebsiteManager";
import { MasterMenuManager } from "@/components/admin/settings/MasterMenuManager";
import { UserManager } from "@/components/admin/settings/UserManager";
import { SecuritySettings } from "@/components/admin/settings/SecuritySettings";
import { VoucherManager } from "@/components/admin/settings/VoucherManager";
import { NotificationManager } from "@/components/admin/settings/NotificationManager";
import { QrManager } from "@/components/admin/settings/QrManager";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"website" | "menu" | "users" | "security" | "vouchers" | "notifications" | "qr">("website");
  
  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Master Admin</h1>
        <p className="text-sm text-muted-foreground">Kelola website, menu global, dan keamanan tingkat lanjut</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("website")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "website" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Globe className="size-4" /> Kelola Banner
        </button>
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "vouchers" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Ticket className="size-4" /> Voucher
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "notifications" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <BellRing className="size-4" /> Notifikasi
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "qr" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <QrCode className="size-4" /> QR Meja
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "menu" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Coffee className="size-4" /> Kelola Menu Global
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Users className="size-4" /> Pengguna
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === "security" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <ShieldCheck className="size-4" /> Keamanan Akun
        </button>
      </div>

      {activeTab === "website" && <WebsiteManager />}
      {activeTab === "menu" && <MasterMenuManager />}
      {activeTab === "users" && <UserManager />}
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "vouchers" && <VoucherManager />}
      {activeTab === "notifications" && <NotificationManager />}
      {activeTab === "qr" && <QrManager />}
    </AdminShell>
  );
}
