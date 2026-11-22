import type { Categoria } from "../types/categoria";
import { api } from "./api";

export async function listCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}
