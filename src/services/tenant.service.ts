import { api } from "./api";
import type { Tenant } from "../types/tenant";

export async function getTenantMe(): Promise<Tenant> {
  const { data } = await api.get<Tenant>("/tenants/me");
  return data;
}

export interface UpdateTenantConfigPayload {
  nome_fantasia?: string;
  ramo_atividade?: string | null;
  email_empresa?: string | null;
  email_proprietario?: string | null;
  usa_modulo_cozinha?: boolean;
  quantidade_comandas?: number;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export async function updateTenantConfiguracoes(payload: UpdateTenantConfigPayload): Promise<Tenant> {
  const { data } = await api.patch<Tenant>("/tenants/configuracoes", payload);
  return data;
}

export async function regenerateTokenAgente(): Promise<Tenant> {
  const { data } = await api.post<Tenant>("/tenants/token-agente");
  return data;
}
