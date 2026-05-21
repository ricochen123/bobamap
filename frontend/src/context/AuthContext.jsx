import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { setAuthTokens, clearAuthTokens } from "../services/api";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me/");
      setUser(data);
    } catch {
      clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setAuthTokens(data.access, data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
    return me.data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setAuthTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
