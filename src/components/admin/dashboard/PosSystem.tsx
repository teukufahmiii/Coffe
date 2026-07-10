import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Minus, Trash2, Printer, Coffee, History, Store, ReceiptText, ChevronRight } from "lucide-react";
import { ReceiptPrint } from "./ReceiptPrint";
import { formatCurrency } from "@/lib/utils";

export function PosSystem({ branch }: { branch: any }) {
  const [viewMode, setViewMode] = useState<"pos" | "history">("pos");

  const [menus, setMenus] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  
  // Checkout state
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  
  // Receipt / Success state
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<any[]>([]);

  // History state
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (viewMode === "pos") {
      fetchMenus();
    } else {
      fetchHistory();
    }
  }, [branch, viewMode]);

  const fetchMenus = async () => {
    setLoading(true);
    let query = supabase.from("menu_items").select("*").eq("available", true);
    const { data, error } = await query;
    if (error) {
      toast.error("Gagal mengambil menu");
    } else {
      setMenus(data || []);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    if (!branch) return;
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(*)
      `)
      .eq("branch_id", branch.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Gagal memuat riwayat transaksi");
    } else {
      setHistoryOrders(data || []);
    }
    setLoadingHistory(false);
  };

  const addToCart = (menu: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item => item.id === menu.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const categories = ["semua", ...Array.from(new Set(menus.map(m => m.category || "lainnya")))];
  const filteredMenus = menus.filter(m => selectedCategory === "semua" || (m.category || "lainnya") === selectedCategory);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal;

  const handleCheckout = async () => {
    if (!branch) {
      toast.error("Pilih cabang outlet terlebih dahulu");
      return;
    }
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    
    setSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          branch_id: branch.id,
          branch: branch.slug, 
          total: total,
          status: "completed",
          order_type: orderType,
          order_source: "pos",
          payment_channel: paymentMethod,
          customer_name: customerName || "Pelanggan Kasir",
          table_number: 1, // Satisfy DB constraint
          agreed_terms: true,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      
      if (itemsError) throw itemsError;

      toast.success("Transaksi berhasil!");
      setCompletedOrder(orderData);
      setCompletedItems(orderItems);
      
      setCart([]);
      setCustomerName("");
      
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal membuat pesanan: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini? Data akan terhapus dari laporan keuangan juga.")) return;
    
    setLoadingHistory(true);
    try {
      // Delete order items first to avoid FK constraint issues if not cascade
      await supabase.from("order_items").delete().eq("order_id", orderId);
      
      // Delete order
      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;
      
      toast.success("Transaksi berhasil dihapus");
      setHistoryOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menghapus transaksi: " + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const viewReceiptFromHistory = (order: any) => {
    setCompletedOrder(order);
    setCompletedItems(order.order_items || []);
  };

  if (completedOrder) {
    return (
      <div className="bg-white border border-border p-10 rounded-[2rem] shadow-sm text-center max-w-md mx-auto mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
          <Printer className="size-10" />
        </div>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">Transaksi Sukses</h2>
        <p className="text-muted-foreground mb-8">Data pesanan telah berhasil direkam ke database.</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handlePrint}
            className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl hover:bg-primary/90 flex justify-center items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
          >
            <Printer className="size-5" /> Cetak Struk
          </button>
          <button 
            onClick={() => {
              setCompletedOrder(null);
              setCompletedItems([]);
            }}
            className="w-full py-4 bg-secondary/50 text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* This will only be visible when printing */}
        <ReceiptPrint order={completedOrder} items={completedItems} branch={branch} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER TOGGLE */}
      <div className="bg-card border border-border rounded-2xl p-2 flex gap-2 shadow-sm shrink-0 w-max">
        <button
          onClick={() => setViewMode("pos")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "pos" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
        >
          <Store className="size-4" /> Buat Pesanan (POS)
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "history" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
        >
          <History className="size-4" /> Riwayat Transaksi
        </button>
      </div>

      {viewMode === "pos" ? (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-260px)] min-h-[600px]">
          {/* LEFT: Menu List */}
          <div className="flex-1 flex flex-col bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-gradient-to-r from-muted/30 to-transparent">
              <h2 className="font-display font-bold text-2xl text-primary mb-4">Daftar Menu</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white border border-border text-muted-foreground hover:border-primary/50 hover:bg-accent/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-secondary/10">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="size-10 animate-spin text-primary" />
                </div>
              ) : selectedCategory === "semua" ? (
                <div className="flex flex-col gap-6">
                  {categories.filter(c => c !== "semua").map(category => {
                    const items = filteredMenus.filter(m => (m.category || "lainnya") === category);
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <h3 className="font-display font-bold text-lg text-primary mb-3 capitalize bg-white/50 border border-border inline-block px-4 py-1.5 rounded-xl shadow-sm">
                          {category}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                          {items.map((menu) => (
                            <button
                              key={menu.id}
                              onClick={() => addToCart(menu)}
                              className="flex flex-col text-left border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all bg-white group hover:-translate-y-1"
                            >
                              <div className="h-36 w-full bg-secondary/50 relative overflow-hidden">
                                {menu.image_url ? (
                                  <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex justify-center items-center text-muted-foreground"><Coffee className="size-8 opacity-20" /></div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">{menu.name}</h3>
                                <p className="text-primary font-bold mt-2 text-base">{formatCurrency(menu.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredMenus.map((menu) => (
                    <button
                      key={menu.id}
                      onClick={() => addToCart(menu)}
                      className="flex flex-col text-left border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all bg-white group hover:-translate-y-1"
                    >
                      <div className="h-36 w-full bg-secondary/50 relative overflow-hidden">
                        {menu.image_url ? (
                          <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex justify-center items-center text-muted-foreground"><Coffee className="size-8 opacity-20" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">{menu.name}</h3>
                        <p className="text-primary font-bold mt-2 text-base">{formatCurrency(menu.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cart & Checkout */}
          <div className="w-full lg:w-[420px] flex flex-col bg-white border border-border rounded-[2rem] shadow-sm overflow-hidden shrink-0">
            <div className="p-6 border-b border-border bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ReceiptText className="size-20" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-1 relative z-10">Keranjang</h2>
              <p className="text-primary-foreground/80 text-sm relative z-10">{cart.length} item dipilih</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-secondary/20">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <ShoppingCartIcon className="size-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg">Belum ada pesanan</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-white p-4 rounded-2xl border border-border items-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1 mb-1">{item.name}</h4>
                      <p className="text-primary font-bold text-sm">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1.5 bg-white rounded-lg hover:bg-black/5 shadow-sm text-foreground"><Minus className="size-3.5" /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1.5 bg-white rounded-lg hover:bg-black/5 shadow-sm text-foreground"><Plus className="size-3.5" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-xl ml-1 transition-colors"><Trash2 className="size-4" /></button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Panel */}
            <div className="p-6 border-t border-border bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                    <label className="text-xs font-bold mb-1.5 block text-muted-foreground">Tipe Pesanan</label>
                    <select value={orderType} onChange={e => setOrderType(e.target.value)} className="w-full p-2.5 border-2 border-border rounded-xl text-sm outline-none focus:border-primary font-semibold bg-background">
                      <option value="dine-in">Dine In</option>
                      <option value="pickup">Takeaway</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold mb-1.5 block text-muted-foreground">Pembayaran</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2.5 border-2 border-border rounded-xl text-sm outline-none focus:border-primary font-semibold bg-background">
                      <option value="tunai">Tunai</option>
                      <option value="qris">QRIS</option>
                      <option value="debit">Debit/Kredit</option>
                    </select>
                 </div>
                 <div className="col-span-2">
                    <label className="text-xs font-bold mb-1.5 block text-muted-foreground">Nama Pelanggan (Opsional)</label>
                    <input type="text" placeholder="Masukkan nama..." value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 border-2 border-border rounded-xl text-sm outline-none focus:border-primary font-medium bg-background" />
                 </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-muted-foreground">Total Tagihan</span>
                <span className="font-display font-black text-3xl text-primary tracking-tight">{formatCurrency(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
                className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl hover:bg-primary/90 flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
              >
                {submitting ? <Loader2 className="size-6 animate-spin" /> : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="bg-white border border-border rounded-[2rem] overflow-hidden shadow-sm p-6 min-h-[600px]">
          <h2 className="font-display font-bold text-2xl text-primary mb-6">Riwayat Transaksi</h2>
          
          {loadingHistory ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="size-10 animate-spin text-primary" />
            </div>
          ) : historyOrders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-border">
              <ReceiptText className="size-16 mx-auto mb-4 opacity-50" />
              <p className="font-semibold text-lg">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {historyOrders.map((order) => (
                <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-bold text-sm bg-secondary px-2 py-0.5 rounded text-secondary-foreground">#{order.queue_number || order.id.split("-")[0]}</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">{order.order_source === 'pos' ? 'kasir' : order.order_type} • {order.payment_channel}</span>
                    </div>
                    <p className="font-semibold">{order.customer_name || "Pelanggan Kasir"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Total Transaksi</p>
                      <p className="font-display font-bold text-xl text-primary">{formatCurrency(order.total)}</p>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center justify-center p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="size-5" />
                      </button>
                      <button 
                        onClick={() => viewReceiptFromHistory(order)}
                        className="flex items-center justify-center p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
                        title="Lihat & Cetak Struk"
                      >
                        <Printer className="size-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
