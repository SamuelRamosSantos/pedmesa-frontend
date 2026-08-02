import type { FormaPagamento } from "../../services/comanda.service";

export interface PagamentoLancado {
  id: number;
  forma: FormaPagamento;
  valor: number;
}
