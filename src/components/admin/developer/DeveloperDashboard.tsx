import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Database, Activity, Clock, ShieldAlert, Cpu, AlertTriangle, Info, ShieldCheck, ArrowLeft, Settings, Power } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type SystemLog = { id: string; level: string; message: string; context: any; created_at: string; };
type AuditLog = { id: string; action: string; resource_type: string; details: any; created_at: string; user_id: string; };
type SystemMetrics = { database_size_bytes: number; active_connections: number; total_logs: number; uptime_hours: number; };

export function DeveloperDashboard() {
  const [activeTab, setActiveTab] = useState<"monitoring" | "audit" | "settings">("monitoring");
  
  // Monitoring State
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Audit State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Settings State
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch System Logs
      const { data: sysLogs } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (sysLogs) setLogs(sysLogs as SystemLog[]);

      // Fetch Audit Logs
      const { data: aLogs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (aLogs) setAuditLogs(aLogs as AuditLog[]);

      // Fetch Maintenance Mode
      const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'maintenance_mode').single();
      if (settings?.value) {
        setIsMaintenance(settings.value.active);
        setMaintenanceMsg(settings.value.message || "");
      }

      // Fetch Metrics
      setLoadingMetrics(true);
      try {
        const { data: metricsData, error } = await supabase.rpc('get_system_metrics');
        if (!error && metricsData) setMetrics(metricsData as unknown as SystemMetrics);
      } catch (err) {} finally { setLoadingMetrics(false); }
    };

    fetchInitialData();

    // Subscriptions
    const logChannel = supabase.channel('dashboard_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setLogs((cur) => [payload.new as SystemLog, ...cur].slice(0, 100));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setAuditLogs((cur) => [payload.new as AuditLog, ...cur].slice(0, 100));
      })
      .subscribe();

    return () => { supabase.removeChannel(logChannel); };
  }, []);

  const toggleMaintenance = async () => {
    setIsSaving(true);
    const newValue = { active: !isMaintenance, message: maintenanceMsg || "Sistem sedang dalam peningkatan untuk memberikan layanan ngopi terbaik." };
    const { error } = await supabase.from('system_settings').update({ value: newValue }).eq('key', 'maintenance_mode');
    
    setIsSaving(false);
    if (!error) {
      setIsMaintenance(!isMaintenance);
      toast.success(!isMaintenance ? "Mode Perbaikan Diaktifkan!" : "Sistem Kembali Normal!");
    } else {
      toast.error("Gagal mengubah pengaturan");
    }
  };

  const clearOldLogs = async () => {
    if (!confirm("Yakin ingin menghapus semua log sistem dan audit yang usianya lebih dari 30 hari? Tindakan ini akan membebaskan memori database.")) return;
    
    setIsClearingLogs(true);
    try {
      const { data, error } = await supabase.rpc('clear_old_logs');
      if (error) throw error;
      
      const result = data as any;
      toast.success(`Berhasil! ${result.deleted_system_logs} Log Sistem & ${result.deleted_audit_logs} Log Audit telah dihapus.`);
      
      // Update UI metrics immediately if possible, or let Realtime/Reload handle it
      if (metrics) {
        setMetrics({
          ...metrics,
          total_logs: Math.max(0, metrics.total_logs - (result.deleted_system_logs + result.deleted_audit_logs))
        });
      }
    } catch (err) {
      toast.error("Gagal membersihkan sampah log");
    } finally {
      setIsClearingLogs(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION WITH PREMIUM UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-accent/20 to-transparent p-6 rounded-2xl border border-accent/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80">
              <ArrowLeft className="size-4" /> Kembali ke Admin
            </Link>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dasbor Pengembang
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base font-medium">
            Pusat kendali enterprise: Monitoring, Audit Keamanan, & Sistem
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isMaintenance && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-full text-sm font-bold animate-pulse">
              <ShieldAlert className="size-4" /> MODE PERBAIKAN AKTIF
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full text-sm font-semibold shadow-sm backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Sistem Online
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex p-1 space-x-1 bg-secondary/50 rounded-xl w-full md:w-max backdrop-blur-sm border border-border">
        <button onClick={() => setActiveTab("monitoring")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "monitoring" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Activity className="size-4" /> Monitoring
        </button>
        <button onClick={() => setActiveTab("audit")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "audit" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <ShieldCheck className="size-4" /> Log Audit Keamanan
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "settings" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Settings className="size-4" /> Sistem & Fitur (Flags)
        </button>
      </div>

      {/* TAB CONTENT: MONITORING */}
      {activeTab === "monitoring" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Memori / Ukuran DB</CardTitle>
                <div className="p-2 bg-accent/10 rounded-lg"><Database className="size-4 text-accent" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">
                  {loadingMetrics ? "..." : metrics ? formatBytes(metrics.database_size_bytes) : "N/A"}
                </div>
                {metrics ? (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${Math.min((metrics.database_size_bytes / (500 * 1024 * 1024)) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium text-right">dari kapasitas 500 MB</p>
                  </div>
                ) : <p className="text-xs text-muted-foreground mt-1">Menunggu metrik...</p>}
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Koneksi Aktif</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="size-4 text-blue-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{loadingMetrics ? "..." : metrics?.active_connections ?? "N/A"}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Koneksi DB saat ini</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Log Sistem</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg"><Terminal className="size-4 text-purple-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{loadingMetrics ? "..." : metrics?.total_logs ?? logs.length}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Error & event tercatat</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Waktu Aktif</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Clock className="size-4 text-emerald-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{loadingMetrics ? "..." : metrics ? `${metrics.uptime_hours.toFixed(1)}j` : "N/A"}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Sejak restart terakhir</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-md overflow-hidden">
            <CardHeader className="bg-secondary/40 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Terminal className="size-5 text-primary" /></div>
                <div>
                  <CardTitle>Konsol Error Langsung (Live)</CardTitle>
                  <CardDescription className="mt-1">Aliran bug dan error sistem secara real-time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-[#0f1115] text-gray-300 w-full">
                <div className="max-h-[400px] overflow-y-auto p-5 space-y-3 font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 py-16">
                      <ShieldCheck className="size-12 mb-3 text-emerald-500/50" />
                      <p className="font-medium">Belum ada log yang terekam.</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg border bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-2">
                            <span className={`font-bold uppercase text-[10px] tracking-wider mr-2 px-2 py-0.5 rounded ${log.level === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {log.level}
                            </span>
                            <span className="font-semibold">{log.message}</span>
                          </div>
                          <div className="text-[10px] opacity-50 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleTimeString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border shadow-md overflow-hidden">
            <CardHeader className="bg-secondary/40 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><ShieldCheck className="size-5 text-emerald-500" /></div>
                <div>
                  <CardTitle>Log Audit Keamanan</CardTitle>
                  <CardDescription className="mt-1">Rekam jejak seluruh aktivitas pengguna dan admin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                    <tr>
                      <th className="px-6 py-3">Waktu</th>
                      <th className="px-6 py-3">Aksi</th>
                      <th className="px-6 py-3">Target (Resource)</th>
                      <th className="px-6 py-3">Detail Tambahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">Belum ada aktivitas terekam.</td></tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-xs">
                            {new Date(log.created_at).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 font-semibold text-primary">{log.action}</td>
                          <td className="px-6 py-4">
                            {log.resource_type ? <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">{log.resource_type}</span> : "-"}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                            {Object.keys(log.details || {}).length > 0 ? JSON.stringify(log.details) : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS (FEATURE FLAGS) */}
      {activeTab === "settings" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Maintenance Mode Card */}
            <Card className={`border-2 transition-all duration-500 ${isMaintenance ? "border-rose-500 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] bg-rose-500/5" : "border-border shadow-md"}`}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-xl ${isMaintenance ? "bg-rose-500 text-white animate-pulse" : "bg-secondary text-muted-foreground"}`}>
                    <Power className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Mode Perbaikan (Maintenance)</CardTitle>
                    <CardDescription className="mt-1">Kunci aplikasi untuk semua pelanggan seketika.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Pesan yang ditampilkan ke pelanggan:</label>
                  <textarea 
                    className="w-full min-h-[80px] p-3 rounded-lg border bg-background text-sm resize-none focus:ring-2 focus:ring-accent outline-none transition-all"
                    value={maintenanceMsg}
                    onChange={(e) => setMaintenanceMsg(e.target.value)}
                    placeholder="Contoh: Sistem sedang dalam peningkatan..."
                  />
                </div>
                
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="text-sm">
                    Status saat ini: <span className={`font-bold ${isMaintenance ? "text-rose-500" : "text-emerald-500"}`}>{isMaintenance ? "AKTIF (Sistem Dikunci)" : "NONAKTIF (Normal)"}</span>
                  </div>
                  <button 
                    onClick={toggleMaintenance}
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95 ${
                      isMaintenance 
                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" 
                        : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                    }`}
                  >
                    {isSaving ? "Menyimpan..." : (isMaintenance ? "Kembalikan Normal" : "Aktifkan Perbaikan")}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Database Maintenance Card */}
            <Card className="border-border shadow-md transition-all duration-500 hover:border-accent/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary rounded-xl text-muted-foreground">
                    <Database className="size-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Perawatan Database</CardTitle>
                    <CardDescription className="mt-1">Pembersihan memori & sampah data.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex flex-col gap-2">
                      <div>
                        <div className="font-semibold text-sm">Bersihkan Log Lama (Auto-Sweep)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Hapus permanen semua log sistem dan log audit yang berumur lebih dari 30 hari. Sangat direkomendasikan ditekan setiap akhir bulan untuk menghemat memori Free Tier (500MB).
                        </div>
                      </div>
                      <button 
                        onClick={clearOldLogs}
                        disabled={isClearingLogs}
                        className="mt-2 w-full px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent rounded-lg text-sm font-semibold transition-all"
                      >
                        {isClearingLogs ? "Sedang membersihkan..." : "Bersihkan Sampah Database Sekarang"}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
