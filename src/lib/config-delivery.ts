import type { UpdateTenantConfigPayload } from "../services/tenant.service";
import type { Tenant } from "../types/tenant";

// Configuração do delivery em "Configurações da Empresa" (PED-111). Valores do formulário
// em centavos (CurrencyInput); a API recebe reais.

export interface FormConfigDelivery {
  ativo: boolean;
  // Desligado = taxa padrão null: bairro fora da lista não é atendido.
  atendeForaDaLista: boolean;
  taxaPadraoCents: number;
  pedidoMinimoCents: number;
}

const paraCentavos = (reais: number) => Math.round(reais * 100);

export function formConfigDelivery(
  tenant: Pick<Tenant, "delivery_ativo" | "taxa_entrega_padrao" | "pedido_minimo_delivery">
): FormConfigDelivery {
  return {
    ativo: tenant.delivery_ativo,
    atendeForaDaLista: tenant.taxa_entrega_padrao !== null,
    taxaPadraoCents: tenant.taxa_entrega_padrao === null ? 0 : paraCentavos(tenant.taxa_entrega_padrao),
    pedidoMinimoCents: paraCentavos(tenant.pedido_minimo_delivery),
  };
}

export function payloadConfigDelivery(
  form: FormConfigDelivery
): Required<Pick<UpdateTenantConfigPayload, "delivery_ativo" | "taxa_entrega_padrao" | "pedido_minimo_delivery">> {
  return {
    delivery_ativo: form.ativo,
    taxa_entrega_padrao: form.atendeForaDaLista ? form.taxaPadraoCents / 100 : null,
    pedido_minimo_delivery: form.pedidoMinimoCents / 100,
  };
}
