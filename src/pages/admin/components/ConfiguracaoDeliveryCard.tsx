import { MapPinned, Save, Truck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { CurrencyInput } from "../../../components/ui/CurrencyInput";
import { Switch } from "../../../components/ui/Switch";
import { useToast } from "../../../contexts/ToastContext";
import { getApiErrorMessage } from "../../../lib/api-error";
import {
  type FormConfigDelivery,
  formConfigDelivery,
  payloadConfigDelivery,
} from "../../../lib/config-delivery";
import { updateTenantConfiguracoes } from "../../../services/tenant.service";
import type { Tenant } from "../../../types/tenant";

interface ConfiguracaoDeliveryCardProps {
  tenant: Tenant;
  onSalvo: () => Promise<void> | void;
}

// Configuração do delivery do estabelecimento (PED-111). O pai remonta o card (key) quando
// os dados do tenant mudam, então o formulário sempre parte do valor salvo.
export function ConfiguracaoDeliveryCard({
  tenant,
  onSalvo,
}: ConfiguracaoDeliveryCardProps) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormConfigDelivery>(() =>
    formConfigDelivery(tenant),
  );
  const [salvando, setSalvando] = useState(false);

  const alterar = (alteracao: Partial<FormConfigDelivery>) =>
    setForm((atual) => ({ ...atual, ...alteracao }));

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);

    try {
      await updateTenantConfiguracoes(payloadConfigDelivery(form));
      showToast("Configuração do delivery salva.", "success");
      await onSalvo();
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          "Não foi possível salvar a configuração do delivery.",
        ),
        "error",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <h2 className="text-titulo-secao text-slate-900 dark:text-white">
            Delivery
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/delivery/taxas")}
        >
          <MapPinned className="h-4 w-4" />
          Bairros e taxas
        </Button>
      </div>

      <form onSubmit={salvar} className="mt-4 flex flex-col gap-5" noValidate>
        <Switch
          checked={form.ativo}
          onChange={(ativo) => alterar({ ativo })}
          label="Delivery ativo"
          description={
            form.ativo
              ? "A expedição pode registrar pedidos para entrega."
              : "Desativado: não é possível cotar nem registrar pedidos de delivery."
          }
        />

        <div className="flex flex-col gap-3">
          <Switch
            checked={form.atendeForaDaLista}
            onChange={(atendeForaDaLista) => alterar({ atendeForaDaLista })}
            label="Atender bairros fora da lista"
            description={
              form.atendeForaDaLista
                ? "Bairros sem taxa cadastrada são atendidos pela taxa padrão abaixo."
                : 'Desligado: só entrega nos bairros cadastrados em "Bairros e taxas".'
            }
          />
          {form.atendeForaDaLista && (
            <div className="sm:max-w-xs">
              <CurrencyInput
                label="Taxa padrão (fora da lista)"
                valueCents={form.taxaPadraoCents}
                onChangeCents={(taxaPadraoCents) =>
                  alterar({ taxaPadraoCents })
                }
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:max-w-xs">
          <CurrencyInput
            label="Pedido mínimo (valor dos itens)"
            valueCents={form.pedidoMinimoCents}
            onChangeCents={(pedidoMinimoCents) =>
              alterar({ pedidoMinimoCents })
            }
          />
          <p className="text-legenda text-slate-500 dark:text-slate-400">
            R$ 0,00 = sem pedido mínimo. A taxa de entrega não conta.
          </p>
        </div>

        <Button type="submit" isLoading={salvando} className="self-start">
          <Save className="h-4 w-4" />
          Salvar delivery
        </Button>
      </form>
    </Card>
  );
}
