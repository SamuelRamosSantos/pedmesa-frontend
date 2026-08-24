import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearStoredUser, getStoredUser, setStoredUser } from "../lib/auth-storage";
import { api } from "../services/api";
import type { AuthUser } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = useCallback((newUser: AuthUser) => {
    setStoredUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);

    // Um cookie HttpOnly só some quando o próprio backend manda limpar — sem
    // await de propósito, a UI não deve travar esperando essa chamada terminar.
    api.post("/auth/logout").catch(() => {});
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
}
