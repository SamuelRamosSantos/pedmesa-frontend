export interface Tenant {
  id: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  ativo: boolean;
  quantidade_comandas: number;
  razao_social: string | null;
  inscricao_estadual: string | null;
  ramo_atividade: string | null;
  nome_proprietario: string | null;
  cpf_proprietario: string | null;
  email_empresa: string | null;
  email_proprietario: string | null;
  usa_modulo_cozinha: boolean;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  token_agente: string | null;
  delivery_ativo: boolean;
  // null = não atende bairros fora da lista de taxas.
  taxa_entrega_padrao: number | null;
  pedido_minimo_delivery: number;
  criado_em: string;
}
