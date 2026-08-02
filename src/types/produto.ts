export interface Produto {
  id: string;
  categoria_id: string;
  nome: string;
  preco: number;
  descricao: string | null;
  disponivel: boolean;
}
