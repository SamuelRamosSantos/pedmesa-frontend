import { Clock, MessageSquareText } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CurrencyInput } from "../../components/ui/CurrencyInput";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { NumeroDestaque } from "../../components/ui/NumeroDestaque";
import { OpcaoSelecionavel } from "../../components/ui/OpcaoSelecionavel";
import { Selo } from "../../components/ui/Selo";
import { Switch } from "../../components/ui/Switch";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { TipoAtendimento } from "../../components/ui/TipoAtendimento";
import { TituloPagina } from "../../components/ui/TituloPagina";
import { ROTULO_STATUS_ENTREGA, TOM_STATUS_ENTREGA } from "../../lib/expedicao";
import { STATUS_ITEM_LABEL, TOM_STATUS_ITEM } from "../../lib/status-item";
import { CLASSES_DO_TOM, SIGNIFICADO_DO_TOM, TONS } from "../../lib/tons";
import type { StatusEntrega } from "../../types/delivery";
import type { StatusItem } from "../../types/pedido";

// Página de referência do guia visual (PED-132). Só existe no modo de desenvolvimento
// (rota registrada em App.tsx atrás de import.meta.env.DEV): não entra no build.

const TIPOGRAFIA: {
  classe: string;
  nome: string;
  uso: string;
  medida: string;
}[] = [
  {
    classe: "text-titulo-pagina",
    nome: "titulo-pagina",
    uso: "h1 de cada tela",
    medida: "24px · 1.25 · 600",
  },
  {
    classe: "text-titulo-secao",
    nome: "titulo-secao",
    uso: "h2 de seções, cards e modais",
    medida: "18px · 1.3 · 600",
  },
  {
    classe: "text-destaque tabular-nums",
    nome: "destaque",
    uso: "número do pedido ou da mesa, total",
    medida: "36px · 1.1 · 600",
  },
  {
    classe: "text-corpo",
    nome: "corpo",
    uso: "texto padrão das telas",
    medida: "14px · 1.5 · 400",
  },
  {
    classe: "text-campo",
    nome: "campo",
    uso: "valor digitado em campos",
    medida: "16px · 1.5 · 400",
  },
  {
    classe: "text-legenda",
    nome: "legenda",
    uso: "horário, rótulo, selo, ajuda",
    medida: "12px · 1.4 · 400 (500 em selo)",
  },
];

const EXEMPLO_TIPOGRAFIA: Record<string, string> = {
  "titulo-pagina": "Expedição",
  "titulo-secao": "Itens do pedido",
  destaque: "#0042",
  corpo: "2× X-Burger, sem cebola. Entregar no portão lateral.",
  campo: "Rua das Flores, 120",
  legenda: "há 12 min · previsão 19:40",
};

const STATUS_ITEM: StatusItem[] = [
  "pendente",
  "em_preparo",
  "pronto",
  "entregue",
  "cancelado",
];

const STATUS_ENTREGA: StatusEntrega[] = [
  "em_producao",
  "pronto_para_envio",
  "em_rota",
  "entregue",
  "cancelado",
];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-titulo-secao text-slate-900 dark:text-white">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function GuiaVisual() {
  const [valor, setValor] = useState(4250);
  const [ativo, setAtivo] = useState(true);
  const [opcao, setOpcao] = useState("casa");
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-col gap-10 px-4 py-8 text-corpo">
      <div className="flex items-start justify-between gap-4">
        <TituloPagina apoio="Tokens, tons e componentes base do PedMesa (PED-132). Só no modo de desenvolvimento.">
          Guia visual
        </TituloPagina>
        <ThemeToggle />
      </div>

      <Secao titulo="Tipografia">
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {TIPOGRAFIA.map((linha) => (
            <div
              key={linha.nome}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:items-center"
            >
              <div className="flex flex-col">
                <code className="text-legenda font-medium text-slate-900 dark:text-white">
                  text-{linha.nome}
                </code>
                <span className="text-legenda text-slate-500 dark:text-slate-400">
                  {linha.medida} · {linha.uso}
                </span>
              </div>
              <span
                className={`min-w-0 break-words text-slate-900 dark:text-white ${linha.classe}`}
              >
                {EXEMPLO_TIPOGRAFIA[linha.nome]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Pesos: 400 (texto), 500 (rótulos e botões) e 600 (títulos e números).
          Nada abaixo de 12px.
        </p>
      </Secao>

      <Secao titulo="Tons">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TONS.map((tom) => (
            <div
              key={tom}
              data-testid={`tom-${tom}`}
              className={`flex flex-col gap-3 rounded-2xl border p-4 ${CLASSES_DO_TOM[tom].superficie}`}
            >
              <div className="flex flex-col gap-0.5">
                <code className="text-legenda font-medium">{tom}</code>
                <span className="text-legenda">{SIGNIFICADO_DO_TOM[tom]}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Selo tom={tom}>Suave</Selo>
                <Selo tom={tom} forte>
                  Forte
                </Selo>
                <span className={`font-medium ${CLASSES_DO_TOM[tom].texto}`}>
                  Texto
                </span>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Status">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-legenda font-medium text-slate-500 dark:text-slate-400">
              Item (cozinha e garçom)
            </span>
            <div className="flex flex-wrap gap-2">
              {STATUS_ITEM.map((status) => (
                <Selo
                  key={status}
                  tom={TOM_STATUS_ITEM[status]}
                  riscado={status === "cancelado"}
                >
                  {STATUS_ITEM_LABEL[status]}
                </Selo>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-legenda font-medium text-slate-500 dark:text-slate-400">
              Entrega (expedição)
            </span>
            <div className="flex flex-wrap gap-2">
              {STATUS_ENTREGA.map((status) => (
                <Selo
                  key={status}
                  tom={TOM_STATUS_ENTREGA[status]}
                  riscado={status === "cancelado"}
                >
                  {ROTULO_STATUS_ENTREGA[status]}
                </Selo>
              ))}
            </div>
          </div>
        </Card>
      </Secao>

      <Secao titulo="Identificação do pedido">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <TipoAtendimento tipo="mesa" />
              <NumeroDestaque>12</NumeroDestaque>
            </div>
            <Selo tom={TOM_STATUS_ITEM.em_preparo} forte>
              {STATUS_ITEM_LABEL.em_preparo}
            </Selo>
          </Card>
          <Card className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <TipoAtendimento tipo="delivery" />
              <NumeroDestaque>#0042</NumeroDestaque>
            </div>
            <Selo tom={TOM_STATUS_ITEM.pendente} forte>
              {STATUS_ITEM_LABEL.pendente}
            </Selo>
          </Card>
        </div>
        <Card className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Clock aria-hidden="true" className="h-4 w-4" />
            há 18 min · previsão 19:40
          </span>
          <span className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="font-semibold tabular-nums">2×</span> X-Burger
            <Selo tom="aviso" icone={<MessageSquareText />}>
              obs.
            </Selo>
          </span>
        </Card>
      </Secao>

      <Secao titulo="Ações e campos">
        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Button>Salvar</Button>
            <Button variant="secondary">Voltar</Button>
            <Button variant="ghost">Mostrar mais</Button>
            <Button variant="danger">Excluir</Button>
            <Button isLoading>Salvando</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome do cliente" placeholder="Ex.: Maria Souza" />
            <Input
              label="Telefone"
              defaultValue="1199"
              error="Informe o telefone com DDD."
            />
            <CurrencyInput
              label="Troco para"
              valueCents={valor}
              onChangeCents={setValor}
            />
            <Switch
              label="Entrega ativa"
              description="Clientes podem pedir por delivery."
              checked={ativo}
              onChange={setAtivo}
            />
          </div>
          <div className="flex flex-col gap-2">
            <OpcaoSelecionavel
              selecionada={opcao === "casa"}
              onClick={() => setOpcao("casa")}
            >
              <span className="font-medium">Casa</span>
              <span className="text-slate-600 dark:text-slate-400">
                Rua das Flores, 120 · Pinheiros
              </span>
            </OpcaoSelecionavel>
            <OpcaoSelecionavel
              selecionada={opcao === "trabalho"}
              onClick={() => setOpcao("trabalho")}
            >
              <span className="font-medium">Trabalho</span>
              <span className="text-slate-600 dark:text-slate-400">
                Av. Paulista, 1000 · Bela Vista
              </span>
            </OpcaoSelecionavel>
          </div>
          <div>
            <Button variant="secondary" onClick={() => setModalAberto(true)}>
              Abrir modal
            </Button>
          </div>
        </Card>
      </Secao>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Editar bairro"
      >
        <div className="flex flex-col gap-4">
          <Input label="Bairro" defaultValue="Pinheiros" />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setModalAberto(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={() => setModalAberto(false)}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
