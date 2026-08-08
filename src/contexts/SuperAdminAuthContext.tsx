import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  clearStoredSuperAdminAuth,
  getStoredSuperAdminToken,
  getStoredSuperAdminUser,
  setStoredSuperAdminAuth,
} from "../lib/super-admin-auth-storage";
import type { SuperAdminUser } from "../types/super-admin";

interface SuperAdminAuthContextValue {
  token: string | null;
  superAdmin: SuperAdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, superAdmin: SuperAdminUser) => void;
  logout: () => void;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | undefined>(undefined);

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredSuperAdminToken());
  const [superAdmin, setSuperAdmin] = useState<SuperAdminUser | null>(() => getStoredSuperAdminUser());

  const login = useCallback((newToken: string, newSuperAdmin: SuperAdminUser) => {
    setStoredSuperAdminAuth(newToken, newSuperAdmin);
    setToken(newToken);
    setSuperAdmin(newSuperAdmin);
  }, []);

  const logout = useCallback(() => {
    clearStoredSuperAdminAuth();
    setToken(null);
    setSuperAdmin(null);
  }, []);

  const value = useMemo<SuperAdminAuthContextValue>(
    () => ({ token, superAdmin, isAuthenticated: Boolean(token && superAdmin), login, logout }),
    [token, superAdmin, login, logout]
  );

  return <SuperAdminAuthContext.Provider value={value}>{children}</SuperAdminAuthContext.Provider>;
}

export function useSuperAdminAuth(): SuperAdminAuthContextValue {
  const context = useContext(SuperAdminAuthContext);

  if (!context) {
    throw new Error("useSuperAdminAuth deve ser usado dentro de um SuperAdminAuthProvider.");
  }

  return context;
}
