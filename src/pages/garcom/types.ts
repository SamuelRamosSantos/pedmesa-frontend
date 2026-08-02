export interface CartItem {
  id: string;
  produtoId: string;
  produtoNome: string;
  precoUnitario: number;
  quantidade: number;
  integranteId: string | null;
  observacao: string;
}
