import type { CreateTaxaEntregaPayload } from "../services/delivery.service";
import type { TaxaEntrega } from "../types/delivery";

// Cadastro de bairros e taxas de entrega (PED-111).

export interface FormTaxa {
  cidade: string;
  bairro: string;
  valorCents: number;
  // Texto do campo: vazio = sem estimativa.
  tempoEstimado: string;
}

export type CampoFormTaxa = "cidade" | "bairro" | "tempoEstimado";

export type ResultadoFormTaxa =
  | { ok: true; payload: CreateTaxaEntregaPayload }
  | { ok: false; erros: Partial<Record<CampoFormTaxa, string>> };

// Mesmo limite do backend (taxa-entrega-input.validator).
const TEMPO_MAXIMO_MIN = 24 * 60;

export function formDaTaxa(
  taxa: TaxaEntrega | null,
  cidadePadrao: string,
): FormTaxa {
  return taxa === null
    ? { cidade: cidadePadrao, bairro: "", valorCents: 0, tempoEstimado: "" }
    : {
        cidade: taxa.cidade,
        bairro: taxa.bairro,
        valorCents: Math.round(taxa.valor * 100),
        tempoEstimado:
          taxa.tempo_estimado_min === null
            ? ""
            : String(taxa.tempo_estimado_min),
      };
}

export function validarFormTaxa(form: FormTaxa): ResultadoFormTaxa {
  const erros: Partial<Record<CampoFormTaxa, string>> = {};
  const cidade = form.cidade.trim();
  const bairro = form.bairro.trim();
  const tempoTexto = form.tempoEstimado.trim();
  const tempo = Number(tempoTexto);

  if (cidade === "") erros.cidade = "Informe a cidade.";
  if (bairro === "") erros.bairro = "Informe o bairro.";
  if (
    tempoTexto !== "" &&
    (!Number.isInteger(tempo) || tempo < 1 || tempo > TEMPO_MAXIMO_MIN)
  ) {
    erros.tempoEstimado = `Informe minutos inteiros entre 1 e ${TEMPO_MAXIMO_MIN}, ou deixe vazio.`;
  }

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros };
  }

  return {
    ok: true,
    payload: {
      cidade,
      bairro,
      valor: form.valorCents / 100,
      tempo_estimado_min: tempoTexto === "" ? null : tempo,
    },
  };
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Ordem de leitura (cidade, depois bairro) e busca sem acento por bairro ou cidade.
export function listarTaxas(
  taxas: readonly TaxaEntrega[],
  busca: string,
): TaxaEntrega[] {
  const termo = normalizar(busca);

  return taxas
    .filter(
      (taxa) =>
        termo === "" ||
        normalizar(`${taxa.bairro} ${taxa.cidade}`).includes(termo),
    )
    .sort(
      (a, b) =>
        a.cidade.localeCompare(b.cidade, "pt-BR") ||
        a.bairro.localeCompare(b.bairro, "pt-BR"),
    );
}
