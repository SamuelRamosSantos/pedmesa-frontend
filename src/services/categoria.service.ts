import { api } from "./api";
import type { Categoria } from "../types/categoria";

export async function listCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}
