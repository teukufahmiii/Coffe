import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatRupiah } from "@/lib/format";
import { Download, Calendar, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export function OutletFinanceBoard({ branch }: { branch: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState<"today" | "7days" | "thisMonth" | "all">("thisMonth");
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [branch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("branch", branch)
        .in("status", ["paid", "cooking", "served", "completed"])
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching finance data", error);
      toast.error("Gagal memuat data keuangan outlet");
    } finally {
      setIsLoading(false);
    }
  };

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
      const orderDate = parseISO(o.created_at);
      return isWithinInterval(orderDate, { start: startDate, end: endDate });
    });
  };

  const filteredOrders = getFilteredOrders();

  const totalIncome = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalTransactions = filteredOrders.length;
  const averageOrderValue = totalTransactions > 0 ? totalIncome / totalTransactions : 0;

  const incomeByDate = filteredOrders.reduce((acc, order) => {
    const date = format(parseISO(order.created_at), "dd MMM", { locale: id });
    acc[date] = (acc[date] || 0) + (order.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = Object.keys(incomeByDate)
    .reverse()
    .map(date => ({
      date,
      Pendapatan: incomeByDate[date]
    }));

  const handleDownloadPdf = async () => {
    if (!dashboardRef.current) return;
    
    toast.loading("Menyiapkan PDF...", { id: "pdf-export" });
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan-Keuangan-${branch}-${format(new Date(), "dd-MM-yyyy")}.pdf`);
      
      toast.success("PDF berhasil diunduh!", { id: "pdf-export" });
    } catch (error) {
      console.error("PDF generation error", error);
      toast.error("Gagal men-download PDF", { id: "pdf-export" });
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4" ref={dashboardRef}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Laporan Keuangan Outlet</h2>
          <p className="text-sm text-muted-foreground mt-1">Hanya menampilkan data transaksi untuk cabang {branch}</p>
        </div>
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 rounded-xl border border-primary text-primary px-4 py-2 text-sm font-bold hover:bg-primary/5 transition-all shadow-sm"
        >
          <Download className="size-4" /> Export PDF
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border shadow-sm max-w-xs">
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

      {isLoading ? (
        <div className="grid place-items-center h-40">
          <span className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-start gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-green-100 text-green-600 shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Pendapatan</p>
                <h3 className="font-display text-xl font-bold mt-1 text-green-700">
                  {formatRupiah(totalIncome)}
                </h3>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-start gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pesanan Sukses</p>
                <h3 className="font-display text-xl font-bold mt-1 text-blue-700">
                  {totalTransactions} <span className="text-xs font-normal text-muted-foreground">transaksi</span>
                </h3>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-start gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rata-rata Pesanan</p>
                <h3 className="font-display text-xl font-bold mt-1 text-amber-700">
                  {formatRupiah(averageOrderValue)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-lg mb-6">Tren Pendapatan</h3>
            {lineChartData.length > 0 ? (
              <div className="h-64">
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
              <div className="h-64 grid place-items-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                Belum ada data untuk periode ini
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border bg-slate-50/50">
              <h3 className="font-bold text-base">Rincian Transaksi Terbaru</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">ID Pesanan</th>
                    <th className="px-5 py-3 font-semibold">Tipe</th>
                    <th className="px-5 py-3 font-semibold text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 50).map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium">
                        {format(parseISO(order.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {order.order_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-green-700">
                        {formatRupiah(order.total || 0)}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                        Tidak ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
