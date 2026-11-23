import type { LucideIcon } from "lucide-react";
import { Banknote, CreditCard, Landmark, QrCode } from "lucide-react";
import { FORMA_PAGAMENTO_LABEL } from "../../lib/forma-pagamento";
import { CLASSES_DO_TOM } from "../../lib/tons";
import type { FormaPagamento } from "../../types/comanda";

const ICONE_FORMA: Record<FormaPagamento, LucideIcon> = {
  pix: QrCode,
  dinheiro: Banknote,
  cartao_credito: CreditCard,
  cartao_debito: Landmark,
};

const FORMAS: readonly FormaPagamento[] = [
  "pix",
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
];

interface SeletorFormaPagamentoProps {
  valor: FormaPagamento;
  onChange: (forma: FormaPagamento) => void;
  rotulo: string;
  // Prefixo dos data-testid dos botões ("forma-pix"...).
  testIdPrefixo?: string;
}

// Botões de forma de pagamento com ícone: os mesmos no fechamento do caixa e no delivery.
export function SeletorFormaPagamento({
  valor,
  onChange,
  rotulo,
  testIdPrefixo = "forma",
}: SeletorFormaPagamentoProps) {
  return (
    <fieldset>
      <legend className="text-corpo font-medium text-slate-700 dark:text-slate-300">
        {rotulo}
      </legend>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        {FORMAS.map((forma) => {
          const Icone = ICONE_FORMA[forma];
          const selecionada = valor === forma;

          return (
            <button
              key={forma}
              type="button"
              aria-pressed={selecionada}
              data-testid={`${testIdPrefixo}-${forma}`}
              onClick={() => onChange(forma)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-legenda font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ${
                selecionada
                  ? `border-marca-500 ${CLASSES_DO_TOM.marca.superficie}`
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icone aria-hidden="true" className="h-4 w-4" />
              {FORMA_PAGAMENTO_LABEL[forma]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
