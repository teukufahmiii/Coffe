import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  phone: string;
  name: string;
  avatar_url?: string;
  pin?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = localStorage.getItem("lnr_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Fetch latest data from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", parsedUser.phone)
          .limit(1);
          
        if (data && data.length > 0 && !error) {
          const profile = data[0];
          const updatedUser = { phone: profile.phone, name: profile.name, avatar_url: profile.avatar_url };
          setUser(updatedUser);
          localStorage.setItem("lnr_user", JSON.stringify(updatedUser));
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const checkPhone = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("phone", phone)
        .limit(1);

      if (error) {
        console.error("Error checking phone:", error);
        return { exists: false };
      }

      return {
        exists: data && data.length > 0,
        name: data && data.length > 0 ? data[0].name : undefined
      };
    } catch (e) {
      console.error("Exception checking phone:", e);
      return { exists: false };
    }
  };

  const login = async (phone: string, pin: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", phone)
        .eq("pin", pin)
        .limit(1);
        
      if (error || !data || data.length === 0) {
        return { success: false, message: "PIN salah" };
      }

      const profile = data[0];
      const finalUser = { phone: profile.phone, name: profile.name, avatar_url: profile.avatar_url };
      localStorage.setItem("lnr_user", JSON.stringify(finalUser));
      setUser(finalUser);
      return { success: true };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan sistem" };
    }
  };

  const register = async (phone: string, name: string, pin: string) => {
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert([{ phone, name, pin }])
        .select()
        .limit(1);
        
      if (insertError) {
        console.error("Register error:", insertError);
        // If error is column pin does not exist
        if (insertError.message?.includes("pin")) {
           return { success: false, message: "Migrasi database belum dijalankan. Tolong jalankan migration SQL untuk tabel profiles." };
        }
        return { success: false, message: "Gagal mendaftar" };
      }

      const profile = insertData?.[0] || { phone, name }; // Fallback to provided data if select fails due to RLS
      const finalUser = { phone: profile.phone, name: profile.name, avatar_url: profile.avatar_url };
      localStorage.setItem("lnr_user", JSON.stringify(finalUser));
      setUser(finalUser);
      return { success: true };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan sistem" };
    }
  };

  const logout = () => {
    localStorage.removeItem("lnr_user");
    setUser(null);
  };
  
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("phone", user.phone);
      
    if (error) {
      toast.error("Gagal memperbarui profil");
      return false;
    }
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("lnr_user", JSON.stringify(updatedUser));
    return true;
  };

  return { user, loading, login, register, checkPhone, logout, updateProfile };
}
