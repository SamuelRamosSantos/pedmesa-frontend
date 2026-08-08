import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useSuperAdminAuth } from "../contexts/SuperAdminAuthContext";

interface SuperAdminProtectedRouteProps {
  children: ReactNode;
}

export function SuperAdminProtectedRoute({ children }: SuperAdminProtectedRouteProps) {
  const { isAuthenticated } = useSuperAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
