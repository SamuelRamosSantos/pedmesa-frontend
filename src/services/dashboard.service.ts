import type { DashboardResumo, PeriodoDashboard } from "../types/dashboard";
import { api } from "./api";

export interface DashboardFiltro {
  periodo: PeriodoDashboard;
  data_inicio?: string;
  data_fim?: string;
}

export async function getDashboardResumo(
  filtro: DashboardFiltro,
): Promise<DashboardResumo> {
  const { data } = await api.get<DashboardResumo>("/dashboard", {
    params: filtro,
  });
  return data;
}
