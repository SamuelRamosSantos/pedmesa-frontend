import { api } from "./api";
import type { Produto, ProdutoPayload } from "../types/produto";

export interface ListProdutosFilters {
  categoriaId?: string;
}

export async function listProdutos(filters: ListProdutosFilters = {}): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>("/produtos", {
    params: filters.categoriaId ? { categoria_id: filters.categoriaId } : undefined,
  });
  return data;
}

export async function createProduto(payload: ProdutoPayload): Promise<Produto> {
  const { data } = await api.post<Produto>("/produtos", payload);
  return data;
}

export async function updateProduto(id: string, payload: ProdutoPayload): Promise<Produto> {
  const { data } = await api.put<Produto>(`/produtos/${id}`, payload);
  return data;
}

export async function updateProdutoDisponibilidade(id: string, disponivel: boolean): Promise<Produto> {
  const { data } = await api.patch<Produto>(`/produtos/${id}/disponibilidade`, { disponivel });
  return data;
}

export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/produtos/${id}`);
}
