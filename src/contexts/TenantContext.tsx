import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getTenantMe } from "../services/tenant.service";
import type { Tenant } from "../types/tenant";
import { useAuth } from "./AuthContext";

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await getTenantMe();
      setTenant(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setTenant(null);
      return;
    }

    refetch();
  }, [isAuthenticated, refetch]);

  const value = useMemo<TenantContextValue>(() => ({ tenant, isLoading, refetch }), [tenant, isLoading, refetch]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant deve ser usado dentro de um TenantProvider.");
  }

  return context;
}
