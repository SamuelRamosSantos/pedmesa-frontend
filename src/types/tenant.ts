export interface Tenant {
  id: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  ativo: boolean;
  quantidade_comandas: number;
  criado_em: string;
}
