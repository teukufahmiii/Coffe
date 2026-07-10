import { createFileRoute } from "@tanstack/react-router";
import { OutletManager } from "@/components/admin/settings/OutletManager";

export const Route = createFileRoute("/_authenticated/master/outlets")({
  component: MasterOutlets,
});

function MasterOutlets() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl text-primary">Kelola Outlet</h1>
        <p className="text-sm text-muted-foreground">Kelola daftar cabang, tambah outlet baru, dan atur status buka/tutup.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <OutletManager />
      </div>
    </div>
  );
}
