import type { EnderecoCep } from "../types/cep";

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

// Converte a resposta JSON do ViaCEP para o tipo de domínio. null quando o CEP não existe
// ({ "erro": true }, que versões antigas mandam como "true") ou quando a resposta não tem
// o mínimo para um endereço (cidade e UF).
export function mapearRespostaViaCep(resposta: unknown): EnderecoCep | null {
  if (typeof resposta !== "object" || resposta === null) {
    return null;
  }

  if ("erro" in resposta && (resposta.erro === true || resposta.erro === "true")) {
    return null;
  }

  const cidade = "localidade" in resposta ? texto(resposta.localidade) : "";
  const uf = "uf" in resposta ? texto(resposta.uf).toUpperCase() : "";

  if (cidade === "" || uf === "") {
    return null;
  }

  return {
    logradouro: "logradouro" in resposta ? texto(resposta.logradouro) : "",
    bairro: "bairro" in resposta ? texto(resposta.bairro) : "",
    cidade,
    uf,
  };
}
