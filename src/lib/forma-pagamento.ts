import type { FormaPagamento } from "../types/comanda";

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
};
