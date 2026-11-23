import type { Produto } from "../types/produto";

// Filtro do cardápio por categoria e nome, em ordem alfabética (garçom e delivery).
export function filtrarProdutos(
  produtos: readonly Produto[],
  categoriaId: string | null,
  termo: string,
): Produto[] {
  const termoNormalizado = termo.trim().toLowerCase();

  return produtos
    .filter(
      (produto) => categoriaId === null || produto.categoria_id === categoriaId,
    )
    .filter(
      (produto) =>
        termoNormalizado === "" ||
        produto.nome.toLowerCase().includes(termoNormalizado),
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

// Produto que o Enter da busca adiciona: o primeiro disponível da lista filtrada.
export function primeiroDisponivel(
  produtos: readonly Produto[],
): Produto | null {
  return produtos.find((produto) => produto.disponivel) ?? null;
}
