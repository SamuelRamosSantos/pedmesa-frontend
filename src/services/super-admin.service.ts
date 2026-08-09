import { adminApi } from "./admin-api";
import type { LoginResponseTenant } from "../types/auth";
import type { LeadAdminItem, TenantAdminItem, TenantStatus } from "../types/super-admin";

export interface ListTenantsFilters {
  status?: TenantStatus;
  nome?: string;
}

export async function listTenants(filters: ListTenantsFilters): Promise<TenantAdminItem[]> {
  const { data } = await adminApi.get<TenantAdminItem[]>("/admin/tenants", { params: filters });
  return data;
}

export interface CreateTenantPayload {
  nome_fantasia: string;
  cnpj_cpf: string;
  admin_nome: string;
  admin_email: string;
  admin_senha: string;
}

export async function createTenant(payload: CreateTenantPayload): Promise<TenantAdminItem> {
  const { data } = await adminApi.post<TenantAdminItem>("/admin/tenants", payload);
  return data;
}

export async function updateTenantStatus(tenantId: string, status: TenantStatus): Promise<TenantAdminItem> {
  const { data } = await adminApi.patch<TenantAdminItem>(`/admin/tenants/${tenantId}/status`, { status });
  return data;
}

export interface UpdateTenantPayload {
  nome_fantasia?: string;
  cnpj_cpf?: string;
  razao_social?: string | null;
  inscricao_estadual?: string | null;
  ramo_atividade?: string | null;
  nome_proprietario?: string | null;
  cpf_proprietario?: string | null;
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

export async function updateTenant(tenantId: string, payload: UpdateTenantPayload): Promise<TenantAdminItem> {
  const { data } = await adminApi.patch<TenantAdminItem>(`/admin/tenants/${tenantId}`, payload);
  return data;
}

export async function impersonarTenant(tenantId: string): Promise<LoginResponseTenant> {
  const { data } = await adminApi.post<LoginResponseTenant>(`/admin/tenants/${tenantId}/impersonar`);
  return data;
}

export async function listLeads(): Promise<LeadAdminItem[]> {
  const { data } = await adminApi.get<LeadAdminItem[]>("/admin/leads");
  return data;
}
