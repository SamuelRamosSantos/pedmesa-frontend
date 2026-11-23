import { describe, expect, it } from "vitest";

// Teste de conformidade do guia visual (PED-132, PED-136): impede regressões de
// tipografia e de cor nos diretórios já migrados. A cada novo card de aplicação
// (PED-137 a PED-141), o diretório migrado entra no glob abaixo.

const ARQUIVOS_MIGRADOS = import.meta.glob<string>(
  [
    "../components/**/*.tsx",
    "../pages/caixa/delivery/**/*.tsx",
    "../pages/cozinha/**/*.tsx",
    "../pages/dev/**/*.tsx",
    "../pages/expedicao/**/*.tsx",
  ],
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

const PADROES_PROIBIDOS: { nome: string; regex: RegExp }[] = [
  {
    nome: "pesos font-bold ou font-extrabold (só 400, 500 e 600 são permitidos)",
    regex: /\bfont-(bold|extrabold)\b/g,
  },
  {
    nome: "tamanhos arbitrários fora da escala (text-[10px], text-[11px], text-[13px])",
    regex: /\btext-\[(10|11|13)px\]/g,
  },
  {
    nome: "tamanhos tipográficos fora dos tokens @theme (text-xs a text-5xl)",
    regex: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b/g,
  },
  {
    nome: "cor da marca direta orange-* (usar alias marca-*)",
    regex: /\b(bg|text|border|ring|outline|from|to)-orange-\d+/g,
  },
  {
    nome: "cores decorativas fora da paleta semântica (violet-*, yellow-*, blue-*)",
    regex: /\b(bg|text|border)-(violet|yellow|blue|indigo|purple|pink)-\d+/g,
  },
];

describe("conformidade do guia visual nos diretórios migrados", () => {
  const entradas = Object.entries(ARQUIVOS_MIGRADOS);

  it("encontra arquivos .tsx nos diretórios migrados", () => {
    expect(entradas.length).toBeGreaterThan(0);
  });

  for (const regra of PADROES_PROIBIDOS) {
    it(`não usa ${regra.nome}`, () => {
      const violacoes: string[] = [];

      for (const [caminho, conteudo] of entradas) {
        const ocorrencias = conteudo.match(regra.regex);
        if (ocorrencias && ocorrencias.length > 0) {
          violacoes.push(`${caminho}: ${[...new Set(ocorrencias)].join(", ")}`);
        }
      }

      expect(violacoes).toEqual([]);
    });
  }
});
