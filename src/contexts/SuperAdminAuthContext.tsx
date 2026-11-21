import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  clearStoredSuperAdminUser,
  getStoredSuperAdminUser,
  setStoredSuperAdminUser,
} from "../lib/super-admin-auth-storage";
import { adminApi } from "../services/admin-api";
import type { SuperAdminUser } from "../types/super-admin";

interface SuperAdminAuthContextValue {
  superAdmin: SuperAdminUser | null;
  isAuthenticated: boolean;
  login: (superAdmin: SuperAdminUser) => void;
  logout: () => void;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | undefined>(undefined);

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [superAdmin, setSuperAdmin] = useState<SuperAdminUser | null>(() => getStoredSuperAdminUser());

  const login = useCallback((newSuperAdmin: SuperAdminUser) => {
    setStoredSuperAdminUser(newSuperAdmin);
    setSuperAdmin(newSuperAdmin);
  }, []);

  const logout = useCallback(() => {
    clearStoredSuperAdminUser();
    setSuperAdmin(null);

    // Sem await de propósito — ver o mesmo comentário em AuthContext.tsx.
    adminApi.post("/auth/admin-logout").catch(() => {});
  }, []);

  const value = useMemo<SuperAdminAuthContextValue>(
    () => ({ superAdmin, isAuthenticated: Boolean(superAdmin), login, logout }),
    [superAdmin, login, logout]
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
