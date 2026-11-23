import {
  Clock,
  Loader2,
  MapPin,
  MessageSquareText,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Selo } from "../../../components/ui/Selo";
import { useConsultaPorChave } from "../../../hooks/useConsultaPorChave";
import {
  formatarNumeroEntrega,
  ROTULO_STATUS_ENTREGA,
  TOM_STATUS_ENTREGA,
} from "../../../lib/expedicao";
import { FORMA_PAGAMENTO_LABEL } from "../../../lib/forma-pagamento";
import {
  formatCurrency,
  formatDataHora,
  formatHora,
} from "../../../lib/format";
import { mascararCep, mascararTelefone } from "../../../lib/mascaras";
import { STATUS_ITEM_LABEL } from "../../../lib/status-item";
import { buscarDetalheEntrega } from "../../../services/delivery.service";
import type { DetalheEntrega, EntregaPainel } from "../../../types/delivery";
import { AcoesEntrega, type HandlersAcoesEntrega } from "./AcoesEntrega";

interface DetalheEntregaModalProps extends HandlersAcoesEntrega {
  // Estado atual do painel: as ações usam ele, e o detalhe é recarregado a cada mudança.
  entrega: EntregaPainel;
  ocupada: boolean;
  onFechar: () => void;
}

function Secao({
  titulo,
  icone,
  children,
}: {
  titulo: string;
  icone: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icone}
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: ReactNode;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${destaque ? "text-base font-bold text-slate-900 dark:text-white" : "text-sm text-slate-600 dark:text-slate-300"}`}
    >
      <span>{rotulo}</span>
      <span className="tabular-nums">{valor}</span>
    </div>
  );
}

// Pedido completo de uma entrega (PED-130): cliente, endereço, itens, valores, andamento
// e as mesmas ações de status do card.
export function DetalheEntregaModal({
  entrega,
  ocupada,
  onFechar,
  ...acoes
}: DetalheEntregaModalProps) {
  // Muda a cada "Tentar novamente", para refazer a consulta com a mesma entrega.
  const [tentativa, setTentativa] = useState(0);
  const consultar = useCallback(
    (_chave: string, signal: AbortSignal) =>
      buscarDetalheEntrega(entrega.id, signal),
    [entrega.id],
  );
  // A versão entra na chave: depois de uma ação, o detalhe é buscado de novo.
  const consulta = useConsultaPorChave(
    `${entrega.id}:${entrega.versao}:${tentativa}`,
    consultar,
  );
  const numero = formatarNumeroEntrega(entrega.numero_entrega);

  return (
    <Modal isOpen onClose={onFechar} tamanho="lg" title={`Pedido ${numero}`}>
      <div className="flex flex-col gap-5" data-testid="detalhe-entrega">
        <div className="-mt-2 flex flex-wrap items-center gap-2">
          <Selo
            tom={TOM_STATUS_ENTREGA[entrega.status_entrega]}
            data-testid="detalhe-status-entrega"
          >
            {ROTULO_STATUS_ENTREGA[entrega.status_entrega]}
          </Selo>
          {consulta.valor && !consulta.valor.passa_pela_cozinha && (
            <Selo tom="neutro">Sem itens para a cozinha</Selo>
          )}
        </div>

        {consulta.status === "carregando" && consulta.valor === null && (
          <p className="flex items-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando o pedido...
          </p>
        )}

        {consulta.status === "falhou" && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Não foi possível carregar o pedido.
            <Button
              variant="danger"
              onClick={() => setTentativa((atual) => atual + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {consulta.valor && <Conteudo detalhe={consulta.valor} />}

        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <AcoesEntrega
            entrega={entrega}
            ocupada={ocupada}
            contexto="modal"
            {...acoes}
          />
        </div>
      </div>
    </Modal>
  );
}

function Conteudo({ detalhe }: { detalhe: DetalheEntrega }) {
  const { endereco, valores, pagamento } = detalhe;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Secao titulo="Cliente" icone={<User className="h-3.5 w-3.5" />}>
          <p className="font-semibold text-slate-900 dark:text-white">
            {detalhe.cliente.nome}
          </p>
          <a
            href={`tel:+55${detalhe.cliente.telefone}`}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
          >
            <Phone className="h-3.5 w-3.5" />
            {mascararTelefone(detalhe.cliente.telefone)}
          </a>
        </Secao>

        <Secao titulo="Entregar em" icone={<MapPin className="h-3.5 w-3.5" />}>
          <p className="text-sm text-slate-900 dark:text-white">
            {endereco.logradouro}, {endereco.numero}
            {endereco.complemento && ` - ${endereco.complemento}`}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {endereco.bairro} · {endereco.cidade}/{endereco.uf} · CEP{" "}
            {mascararCep(endereco.cep)}
          </p>
          {endereco.referencia && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">Referência:</span>{" "}
              {endereco.referencia}
            </p>
          )}
        </Secao>
      </div>

      <Secao titulo="Itens" icone={<Receipt className="h-3.5 w-3.5" />}>
        <ul className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
          {detalhe.itens.map((item) => {
            const cancelado = item.status_item === "cancelado";

            return (
              <li
                key={item.id}
                className={`flex flex-col gap-1 px-3 py-2 text-sm ${cancelado ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className={`font-medium text-slate-900 dark:text-white ${cancelado ? "line-through" : ""}`}
                  >
                    <span className="tabular-nums">{item.quantidade}×</span>{" "}
                    {item.produto}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {cancelado
                      ? "Cancelado"
                      : item.precisa_preparo
                        ? STATUS_ITEM_LABEL[item.status_item]
                        : "Sem preparo"}
                  </span>
                  <span className="ml-auto tabular-nums text-slate-600 dark:text-slate-300">
                    {formatCurrency(item.preco_unitario)} ·{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </span>
                </div>
                {item.observacao && (
                  <p className="flex items-start gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {item.observacao}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Secao>

      <div className="grid gap-5 sm:grid-cols-2">
        <Secao
          titulo="Valores e pagamento"
          icone={<Receipt className="h-3.5 w-3.5" />}
        >
          <div className="flex flex-col gap-1.5">
            <Linha rotulo="Subtotal" valor={formatCurrency(valores.subtotal)} />
            {valores.desconto > 0 && (
              <Linha
                rotulo="Desconto"
                valor={`− ${formatCurrency(valores.desconto)}`}
              />
            )}
            <Linha
              rotulo="Taxa de entrega"
              valor={
                valores.taxa_isenta
                  ? "Isenta"
                  : formatCurrency(valores.taxa_entrega)
              }
            />
            <Linha
              rotulo="Total"
              valor={formatCurrency(valores.total)}
              destaque
            />
            <Linha
              rotulo="Pagamento"
              valor={FORMA_PAGAMENTO_LABEL[pagamento.forma]}
            />
            {pagamento.troco_para !== null && (
              <>
                <Linha
                  rotulo="Troco para"
                  valor={formatCurrency(pagamento.troco_para)}
                />
                <Linha
                  rotulo="Levar troco"
                  valor={
                    pagamento.troco_suficiente
                      ? formatCurrency(pagamento.troco)
                      : "Troco para menor que o total"
                  }
                />
              </>
            )}
          </div>
        </Secao>

        <Secao titulo="Andamento" icone={<Clock className="h-3.5 w-3.5" />}>
          <div className="flex flex-col gap-1.5">
            <Linha rotulo="Pedido" valor={formatDataHora(detalhe.criado_em)} />
            {detalhe.previsao_entrega_em && (
              <Linha
                rotulo="Previsão"
                valor={formatHora(detalhe.previsao_entrega_em)}
              />
            )}
            {detalhe.saiu_em && (
              <Linha rotulo="Saiu" valor={formatHora(detalhe.saiu_em)} />
            )}
            {detalhe.entregue_em && (
              <Linha
                rotulo="Entregue"
                valor={formatHora(detalhe.entregue_em)}
              />
            )}
          </div>
          <ol
            className="mt-1 flex flex-col gap-1.5 border-l-2 border-slate-200 pl-3 dark:border-slate-700"
            data-testid="historico-entrega"
          >
            {detalhe.historico.map((registro) => (
              <li
                key={registro.criado_em + registro.status_novo}
                className="text-xs"
              >
                <p className="text-slate-700 dark:text-slate-200">
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">
                    {formatHora(registro.criado_em)}
                  </span>{" "}
                  {registro.status_anterior
                    ? `${ROTULO_STATUS_ENTREGA[registro.status_anterior]} → `
                    : ""}
                  <span className="font-semibold">
                    {ROTULO_STATUS_ENTREGA[registro.status_novo]}
                  </span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    · {registro.usuario_nome ?? "automático"}
                  </span>
                </p>
                {registro.motivo && (
                  <p className="text-slate-500 dark:text-slate-400">
                    Motivo: {registro.motivo}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Secao>
      </div>
    </>
  );
}
