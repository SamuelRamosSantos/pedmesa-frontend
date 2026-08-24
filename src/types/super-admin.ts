export type TenantStatus = "ativo" | "suspenso" | "cancelado";

export interface SuperAdminUser {
  id: string;
  nome: string;
  email: string;
}

export interface LoginResponseSuperAdmin {
  tipo: "super_admin";
  super_admin: SuperAdminUser;
}

export interface TenantAdminItem {
  id: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  status: TenantStatus;
  plano_id: string | null;
  razao_social: string | null;
  inscricao_estadual: string | null;
  ramo_atividade: string | null;
  nome_proprietario: string | null;
  cpf_proprietario: string | null;
  email_empresa: string | null;
  email_proprietario: string | null;
  usa_modulo_cozinha: boolean;
  quantidade_comandas: number;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  criado_em: string;
}

export interface LeadAdminItem {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  nome_estabelecimento: string;
  cpf_cnpj: string;
  criado_em: string;
}
