import { RefreshCw, Search, UtensilsCrossed } from "lucide-react";
import { type KeyboardEvent, type RefObject, useMemo, useState } from "react";
import { ProdutoCard } from "../../../../components/cardapio/ProdutoCard";
import { Button, Card, Input } from "../../../../components/ui";
import { filtrarProdutos, primeiroDisponivel } from "../../../../lib/cardapio";
import { CLASSES_DO_TOM } from "../../../../lib/tons";
import type { Categoria } from "../../../../types/categoria";
import type { Produto } from "../../../../types/produto";

interface CardapioDeliveryProps {
  produtos: Produto[];
  categorias: Categoria[];
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
  onAdicionar: (produto: Produto) => void;
  buscaRef: RefObject<HTMLInputElement | null>;
}

// Cardápio do novo pedido delivery (PED-109, PED-139). Pelo teclado: digita parte do nome
// e Enter adiciona o primeiro produto disponível; com a busca vazia, Enter segue para o
// próximo campo.
export function CardapioDelivery({
  produtos,
  categorias,
  carregando,
  erro,
  onRecarregar,
  onAdicionar,
  buscaRef,
}: CardapioDeliveryProps) {
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [termo, setTermo] = useState("");
  const filtrados = useMemo(
    () => filtrarProdutos(produtos, categoriaId, termo),
    [produtos, categoriaId, termo],
  );

  function aoTeclarNaBusca(evento: KeyboardEvent<HTMLInputElement>) {
    if (
      evento.key !== "Enter" ||
      evento.ctrlKey ||
      evento.metaKey ||
      termo.trim() === ""
    ) {
      return;
    }

    evento.preventDefault();
    const produto = primeiroDisponivel(filtrados);

    if (produto) {
      onAdicionar(produto);
      setTermo("");
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-titulo-secao text-slate-900 dark:text-white">
        Cardápio
      </h2>

      <Input
        ref={buscaRef}
        label="Adicionar produto"
        type="search"
        autoComplete="off"
        placeholder="Digite o nome e tecle Enter para adicionar"
        icon={<Search className="h-4 w-4" />}
        value={termo}
        onChange={(evento) => setTermo(evento.target.value)}
        onKeyDown={aoTeclarNaBusca}
      />

      <fieldset
        className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none]"
        aria-label="Categorias"
      >
        {[{ id: null, nome: "Todos" }, ...categorias].map((categoria) => (
          <button
            key={categoria.id ?? "todos"}
            type="button"
            aria-pressed={categoriaId === categoria.id}
            onClick={() => setCategoriaId(categoria.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-corpo font-medium transition-colors ${
              categoriaId === categoria.id
                ? "bg-marca-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {categoria.nome}
          </button>
        ))}
      </fieldset>

      {carregando && (
        <p className="flex items-center gap-2 py-6 text-corpo text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Carregando cardápio...
        </p>
      )}

      {!carregando && erro && (
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-corpo ${CLASSES_DO_TOM.perigo.superficie}`}
        >
          {erro}
          <Button variant="secondary" onClick={onRecarregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!carregando && !erro && filtrados.length === 0 && (
        <p className="flex items-center gap-2 py-6 text-corpo text-slate-500 dark:text-slate-400">
          <UtensilsCrossed className="h-4 w-4" />
          Nenhum produto encontrado.
        </p>
      )}

      {!carregando && !erro && filtrados.length > 0 && (
        <div className="grid max-h-[28rem] grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 overflow-y-auto pr-1">
          {filtrados.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onAdd={onAdicionar}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
