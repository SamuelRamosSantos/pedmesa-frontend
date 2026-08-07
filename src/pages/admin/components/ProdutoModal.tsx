import { Banknote, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Switch } from "../../../components/ui/Switch";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import { createProduto, updateProduto } from "../../../services/produto.service";
import type { Categoria } from "../../../types/categoria";
import type { Produto } from "../../../types/produto";

interface ProdutoModalProps {
  isOpen: boolean;
  produtoEditando: Produto | null;
  categorias: Categoria[];
  usaModuloCozinha: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProdutoModal({
  isOpen,
  produtoEditando,
  categorias,
  usaModuloCozinha,
  onClose,
  onSaved,
}: ProdutoModalProps) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [precisaPreparo, setPrecisaPreparo] = useState(true);

  const [nomeError, setNomeError] = useState<string | undefined>();
  const [precoError, setPrecoError] = useState<string | undefined>();
  const [categoriaError, setCategoriaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const isEdicao = produtoEditando !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (produtoEditando) {
      setNome(produtoEditando.nome);
      setPreco(String(produtoEditando.preco));
      setCategoriaId(produtoEditando.categoria_id);
      setDescricao(produtoEditando.descricao ?? "");
      setDisponivel(produtoEditando.disponivel);
      setPrecisaPreparo(produtoEditando.precisa_preparo);
    } else {
      setNome("");
      setPreco("");
      setCategoriaId("");
      setDescricao("");
      setDisponivel(true);
      setPrecisaPreparo(true);
    }

    setNomeError(undefined);
    setPrecoError(undefined);
    setCategoriaError(undefined);
    setIsSubmitting(false);
  }, [isOpen, produtoEditando]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNomeError(undefined);
    setPrecoError(undefined);
    setCategoriaError(undefined);

    const precoNumero = Number(preco.replace(",", "."));
    let hasError = false;

    if (!nome.trim()) {
      setNomeError("Informe o nome do produto.");
      hasError = true;
    }

    if (!preco || !Number.isFinite(precoNumero) || precoNumero <= 0) {
      setPrecoError("Informe um preço válido maior que zero.");
      hasError = true;
    }

    if (!categoriaId) {
      setCategoriaError("Selecione uma categoria.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      categoria_id: categoriaId,
      nome: nome.trim(),
      preco: precoNumero,
      descricao: descricao.trim() || null,
      disponivel,
      precisa_preparo: usaModuloCozinha ? precisaPreparo : false,
    };

    try {
      if (produtoEditando) {
        await updateProduto(produtoEditando.id, payload);
        showToast(`Produto "${payload.nome}" atualizado com sucesso.`, "success");
      } else {
        await createProduto(payload);
        showToast(`Produto "${payload.nome}" cadastrado com sucesso.`, "success");
      }

      onSaved();
    } catch (error) {
      showToast(getApiErrorMessage(error, "Não foi possível salvar o produto. Tente novamente."), "error");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdicao ? "Editar produto" : "Novo produto"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome do produto"
          placeholder="Ex.: X-Salada"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          error={nomeError}
          autoFocus
        />

        <Input
          label="Preço (R$)"
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          placeholder="0,00"
          icon={<Banknote className="h-4 w-4" />}
          value={preco}
          onChange={(event) => setPreco(event.target.value)}
          error={precoError}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="produto-categoria" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Categoria
          </label>
          <select
            id="produto-categoria"
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
            className={`rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-800 dark:text-white ${
              categoriaError
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60"
                : "border-slate-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-slate-700"
            }`}
          >
            <option value="">Selecione uma categoria...</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          {categoriaError && <p className="text-sm text-red-600 dark:text-red-400">{categoriaError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="produto-descricao" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Descrição <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
          </label>
          <textarea
            id="produto-descricao"
            rows={2}
            placeholder="Ex.: Sem cebola, acompanha molho especial"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            className="resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Switch checked={disponivel} onChange={setDisponivel} label="Disponível para venda" />

          {usaModuloCozinha && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-800" />

              <Switch
                checked={precisaPreparo}
                onChange={setPrecisaPreparo}
                label="Requer preparo na cozinha/bar?"
                description={
                  !precisaPreparo &&
                  'Este item será marcado como "Pronto" automaticamente assim que o pedido for enviado (ex: bebidas, insumos prontos).'
                }
              />
            </>
          )}
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
