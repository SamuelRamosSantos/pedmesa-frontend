import { api } from "./api";
import type { Produto } from "../types/produto";

export async function listProdutos(): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>("/produtos");
  return data;
}
