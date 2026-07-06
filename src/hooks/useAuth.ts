import { useState, useEffect } from "react";

export interface User {
  phone: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock auth
    const storedUser = localStorage.getItem("lnr_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (phone: string, name: string, pin: string) => {
    // In a real app, verify PIN against DB. For mock, we just log in.
    const newUser = { phone, name };
    localStorage.setItem("lnr_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("lnr_user");
    setUser(null);
  };

  return { user, loading, login, logout };
}
