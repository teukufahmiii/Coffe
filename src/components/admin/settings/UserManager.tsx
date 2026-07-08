import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Users, Star, Pencil, X, Save } from "lucide-react";

function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data && !error) {
      setUsers(data);
    }
    setLoading(false);
  };

  const togglePinVisibility = (id: string) => {
    setVisiblePins(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredUsers = users.filter((u) => 
    (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (u.phone || "").includes(searchQuery)
  );

  return (
    <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl font-bold">Daftar Pengguna</h2>
          <p className="text-sm text-muted-foreground">Lihat pengguna yang telah mendaftar di LNR Coffee</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <input
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 rounded-xl border-2 border-border/50 bg-[#F9F6F0] px-4 py-2 font-medium outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="p-3 font-bold">Nama</th>
              <th className="p-3 font-bold">Nomor HP</th>
              <th className="p-3 font-bold">PIN</th>
              <th className="p-3 font-bold">Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground font-medium">
                  Belum ada pengguna yang mendaftar atau ditemukan.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-[#F9F6F0]/50 transition-colors">
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm tracking-wider font-bold">
                        {visiblePins[u.id] ? u.pin : "****"}
                      </code>
                      <button 
                        onClick={() => togglePinVisibility(u.id)}
                        className="text-muted-foreground hover:text-black transition-colors"
                        title={visiblePins[u.id] ? "Sembunyikan PIN" : "Tampilkan PIN"}
                      >
                        {visiblePins[u.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
