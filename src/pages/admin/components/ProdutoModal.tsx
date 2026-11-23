import { Banknote } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ImageUpload } from "../../../components/ui/ImageUpload";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { RodapeEdicao } from "../../../components/ui/RodapeEdicao";
import { Select } from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { Textarea } from "../../../components/ui/Textarea";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  createProduto,
  deleteProduto,
  updateProduto,
} from "../../../services/produto.service";
import type { Categoria } from "../../../types/categoria";
import type { Produto } from "../../../types/produto";

interface ProdutoModalProps {
  isOpen: boolean;
  produtoEditando: Produto | null;
  categorias: Categoria[];
  usaModuloCozinha: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: (produtoId: string) => void;
}

export function ProdutoModal({
  isOpen,
  produtoEditando,
  categorias,
  usaModuloCozinha,
  onClose,
  onSaved,
  onDeleted,
}: ProdutoModalProps) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [precisaPreparo, setPrecisaPreparo] = useState(true);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);

  const [nomeError, setNomeError] = useState<string | undefined>();
  const [precoError, setPrecoError] = useState<string | undefined>();
  const [categoriaError, setCategoriaError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setImagemUrl(produtoEditando.imagem_url);
    } else {
      setNome("");
      setPreco("");
      setCategoriaId("");
      setDescricao("");
      setDisponivel(true);
      setPrecisaPreparo(true);
      setImagemUrl(null);
    }

    setNomeError(undefined);
    setPrecoError(undefined);
    setCategoriaError(undefined);
    setIsSubmitting(false);
    setIsDeleting(false);
  }, [isOpen, produtoEditando]);

  async function handleExcluir() {
    if (!produtoEditando || !onDeleted) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteProduto(produtoEditando.id);
      showToast(`Produto "${produtoEditando.nome}" excluído.`, "success");
      onDeleted(produtoEditando.id);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Não foi possível excluir o produto."),
        "error",
      );
      setIsDeleting(false);
    }
  }

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
      imagem_url: imagemUrl,
    };

    try {
      if (produtoEditando) {
        await updateProduto(produtoEditando.id, payload);
        showToast(
          `Produto "${payload.nome}" atualizado com sucesso.`,
          "success",
        );
      } else {
        await createProduto(payload);
        showToast(
          `Produto "${payload.nome}" cadastrado com sucesso.`,
          "success",
        );
      }

      onSaved();
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          "Não foi possível salvar o produto. Tente novamente.",
        ),
        "error",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdicao ? "Editar produto" : "Novo produto"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <ImageUpload
          label="Foto do produto"
          value={imagemUrl}
          onChange={setImagemUrl}
          shape="square"
        />

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

        <Select
          id="produto-categoria"
          label="Categoria"
          value={categoriaId}
          onChange={(event) => setCategoriaId(event.target.value)}
          error={categoriaError}
        >
          <option value="">Selecione uma categoria...</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </Select>

        <Textarea
          id="produto-descricao"
          label="Descrição (opcional)"
          rows={2}
          placeholder="Ex.: Sem cebola, acompanha molho especial"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
        />

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Switch
            checked={disponivel}
            onChange={setDisponivel}
            label="Disponível para venda"
          />

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

        <RodapeEdicao
          onCancelar={onClose}
          salvando={isSubmitting}
          excluir={
            produtoEditando && onDeleted
              ? {
                  confirmacao: (
                    <span>
                      Excluir o produto <strong>{produtoEditando.nome}</strong>?
                      Esta ação não pode ser desfeita.
                    </span>
                  ),
                  excluindo: isDeleting,
                  onConfirmar: () => void handleExcluir(),
                }
              : undefined
          }
        />
      </form>
    </Modal>
  );
}
