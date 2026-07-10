import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, Coffee, Store, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export const Route = createFileRoute("/_authenticated/master/")({
  component: MasterDashboard,
});

function MasterDashboard() {
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState("all");

  const { data: totalMenu = 0 } = useQuery({
    queryKey: ["total-menu"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalBranches = 0 } = useQuery({
    queryKey: ["total-branches"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const { data: totalIncome = 0 } = useQuery({
    queryKey: ["total-income", selectedBranch],
    queryFn: async () => {
      let query = supabase.from("orders").select("total").in("status", ["paid", "completed"]);
      if (selectedBranch !== "all") {
        query = query.eq("branch_id", selectedBranch);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.reduce((sum, order) => sum + Number(order.total), 0);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("dashboard_master_stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        queryClient.invalidateQueries({ queryKey: ["total-menu"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["total-users"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "branches" }, () => {
        queryClient.invalidateQueries({ queryKey: ["total-branches"] });
        queryClient.invalidateQueries({ queryKey: ["branches-list"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["total-income"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Helper formatter just in case formatCurrency is not correctly exported
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = [
    { name: selectedBranch === "all" ? "Penghasilan Semua Outlet" : `Penghasilan ${branches.find(b => b.id === selectedBranch)?.name || 'Outlet'}`, value: totalIncome, color: "#22c55e" }, // Green 500
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl text-primary">
            Dashboard Master Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan data (Real-Time) sistem LNR Coffee
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
             <label htmlFor="branch-filter" className="text-xs font-semibold text-muted-foreground">Filter Penghasilan:</label>
             <select
               id="branch-filter"
               value={selectedBranch}
               onChange={(e) => setSelectedBranch(e.target.value)}
               className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
             >
               <option value="all">Semua Outlet</option>
               {branches.map((b) => (
                 <option key={b.id} value={b.id}>
                   {b.name}
                 </option>
               ))}
             </select>
          </div>
          <div className="flex h-fit items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Live Data
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Coffee className="size-6 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Menu
          </h3>
          <p className="mt-2 font-display text-3xl font-bold">{totalMenu}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Users className="size-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Pengguna
          </h3>
          <p className="mt-2 font-display text-3xl font-bold">{totalUsers}</p>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
            <Store className="size-6 text-orange-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Outlet
          </h3>
          <p className="mt-2 font-display text-3xl font-bold">{totalBranches}</p>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <Banknote className="size-6 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground line-clamp-1">
            Penghasilan ({selectedBranch === "all" ? "Semua Outlet" : branches.find((b) => b.id === selectedBranch)?.name || "Outlet"})
          </h3>
          <p className="mt-2 font-display text-2xl font-bold text-green-600">{formatRupiah(totalIncome)}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold mb-6">Grafik Penghasilan</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888888'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#888888'}} tickFormatter={(value) => `Rp ${value / 1000}k`} />
              <Tooltip
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatRupiah(value), "Total"]}
              />
              <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={120}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
