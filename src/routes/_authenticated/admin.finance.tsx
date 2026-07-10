import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { Download, Calendar, DollarSign, ShoppingBag, TrendingUp, Store } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PinGuard } from "@/components/PinGuard";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  head: () => ({ meta: [{ title: "Laporan Keuangan — LNR Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminFinance,
});

function AdminFinance() {
  return (
    <PinGuard title="Akses Laporan Keuangan" pinType="finance">
      <Suspense fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }>
        <FinanceDashboard />
      </Suspense>
    </PinGuard>
  );
}

function FinanceDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState<"today" | "7days" | "thisMonth" | "all">("thisMonth");
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Outlets
      const { data: branchesData } = await supabase.from("branches").select("id, name, slug");
      if (branchesData) setOutlets(branchesData);

      // 2. Fetch Orders (we consider paid, cooking, served, completed as valid income)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["paid", "cooking", "served", "completed"])
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching finance data", error);
      toast.error("Gagal memuat data keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const getFilteredOrders = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (dateRange) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "7days":
        startDate = startOfDay(subDays(now, 6));
        break;
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "all":
      default:
        startDate = new Date("2000-01-01");
        break;
    }

    return orders.filter(o => {
      // Date filter
      const orderDate = parseISO(o.created_at);
      const isDateMatch = isWithinInterval(orderDate, { start: startDate, end: endDate });
      
      // Outlet filter
      const isOutletMatch = selectedOutlet === "all" || o.branch === selectedOutlet;

      return isDateMatch && isOutletMatch;
    });
  };

  const filteredOrders = getFilteredOrders();

  // --- CALCULATION LOGIC ---
  const totalIncome = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalTransactions = filteredOrders.length;
  const averageOrderValue = totalTransactions > 0 ? totalIncome / totalTransactions : 0;

  // Group by Date for Line Chart
  const incomeByDate = filteredOrders.reduce((acc, order) => {
    const date = format(parseISO(order.created_at), "dd MMM", { locale: id });
    acc[date] = (acc[date] || 0) + (order.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = Object.keys(incomeByDate)
    .reverse() // Reverse because fetched descending, we want chronological for chart
    .map(date => ({
      date,
      Pendapatan: incomeByDate[date]
    }));

  // Group by Outlet for Bar Chart (Only useful if 'all' outlets is selected)
  const incomeByOutlet = filteredOrders.reduce((acc, order) => {
    const outletName = outlets.find(b => b.slug === order.branch)?.name || order.branch;
    acc[outletName] = (acc[outletName] || 0) + (order.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.keys(incomeByOutlet).map(name => ({
    name,
    Pendapatan: incomeByOutlet[name]
  }));

  // --- EXPORT PDF ---
  const handleDownloadPdf = async () => {
    if (!dashboardRef.current) return;
    
    toast.loading("Menyiapkan PDF...", { id: "pdf-export" });
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // higher resolution
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan-Keuangan-LNR-${format(new Date(), "dd-MM-yyyy")}.pdf`);
      
      toast.success("PDF berhasil diunduh!", { id: "pdf-export" });
    } catch (error) {
      console.error("PDF generation error", error);
      toast.error("Gagal men-download PDF", { id: "pdf-export" });
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6" ref={dashboardRef}>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 bg-white/50 p-6 rounded-2xl">
          <div>
            <h1 className="font-display text-3xl font-bold">Laporan Keuangan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pantau arus kas dan statistik performa outlet
            </p>
          </div>
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-all shadow-sm"
          >
            <Download className="size-4" /> Download PDF
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border shadow-sm flex-1 md:max-w-xs">
            <Calendar className="size-4 text-muted-foreground" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
              <option value="all">Sepanjang Waktu</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border shadow-sm flex-1 md:max-w-xs">
            <Store className="size-4 text-muted-foreground" />
            <select 
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            >
              <option value="all">Semua Outlet</option>
              {outlets.map(o => (
                <option key={o.id} value={o.slug}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid place-items-center h-64">
            <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-green-100 text-green-600 shrink-0">
                  <DollarSign className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Pendapatan</p>
                  <h3 className="font-display text-2xl font-bold mt-1 text-green-700">
                    {formatRupiah(totalIncome)}
                  </h3>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                  <ShoppingBag className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Pesanan Berhasil</p>
                  <h3 className="font-display text-2xl font-bold mt-1 text-blue-700">
                    {totalTransactions} <span className="text-sm font-normal text-muted-foreground">transaksi</span>
                  </h3>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                  <TrendingUp className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Rata-rata Pesanan</p>
                  <h3 className="font-display text-2xl font-bold mt-1 text-amber-700">
                    {formatRupiah(averageOrderValue)}
                  </h3>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="font-bold text-lg mb-6">Tren Pendapatan</h3>
                {lineChartData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => `Rp${value/1000}k`}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => formatRupiah(value)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="Pendapatan" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 grid place-items-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                    Belum ada data untuk periode ini
                  </div>
                )}
              </div>

              {/* Bar Chart (Only show if multiple outlets) */}
              {selectedOutlet === "all" && outlets.length > 1 && (
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-6">Perbandingan Outlet</h3>
                  {barChartData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(value) => `Rp${value/1000}k`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                          />
                          <RechartsTooltip 
                            formatter={(value: number) => formatRupiah(value)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="Pendapatan" fill="#5C4033" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-72 grid place-items-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                      Belum ada data untuk periode ini
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mt-2">
              <div className="p-6 border-b border-border bg-slate-50/50">
                <h3 className="font-bold text-lg">Rincian Transaksi Terbaru</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Tanggal</th>
                      <th className="px-6 py-4 font-semibold">ID Pesanan</th>
                      <th className="px-6 py-4 font-semibold">Outlet</th>
                      <th className="px-6 py-4 font-semibold">Tipe</th>
                      <th className="px-6 py-4 font-semibold text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, 50).map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {format(parseISO(order.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          #{order.queue_number || order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {order.branch}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-secondary px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                            {order.order_source === 'pos' ? 'kasir' : order.order_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-700">
                          {formatRupiah(order.total || 0)}
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Tidak ada transaksi pada periode ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length > 50 && (
                <div className="p-4 text-center border-t border-border bg-slate-50">
                  <p className="text-xs text-muted-foreground">Menampilkan 50 transaksi terbaru</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
